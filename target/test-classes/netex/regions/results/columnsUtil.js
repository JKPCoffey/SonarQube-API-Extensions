/**
 * This module clones column.js and adds a checkbox cell to start of it.
 * Returns: array of JSON object, representing the columns used by the table in Results.js.
 */
define([
    '../../widgets/resultscell/ResultsCell'
], function (ResultsCell) {

    return {

        /**
         * Don't use column heading strings from locales as they should not be translated.
         * This is to remain consistent with the attribute names that are retrieved from models in other column headings.
         */
        NAME_COLUMN_HEADING: 'Name',
        MO_TYPE_COLUMN_HEADING: 'MO Type',
        NODE_NAME_COLUMN_HEADING: 'Node Name',
        SYNC_STATUS_COLUMN_HEADING: 'Sync Status (CM)',
        PARENT_MO_COLUMN_HEADING: 'Parent MO',

        DEFAULT_ATTRIBUTES: ['moName','moType','mibRootName','cmSyncStatus','parentRDN'],

        getDefaultColumns: function() {
            return [
                {
                    title: this.NAME_COLUMN_HEADING,
                    attribute: 'moName',
                    sortable: true,
                    resizable: true
                },
                {
                    title: this.MO_TYPE_COLUMN_HEADING,
                    attribute: 'moType',
                    sortable: true,
                    resizable: true
                },
                {
                    title: this.NODE_NAME_COLUMN_HEADING,
                    attribute: 'mibRootName',
                    sortable: true,
                    resizable: true
                },
                {
                    title: this.SYNC_STATUS_COLUMN_HEADING,
                    attribute: 'cmSyncStatus',
                    sortable: true,
                    resizable: true
                },
                {
                    title: this.PARENT_MO_COLUMN_HEADING,
                    attribute: 'parentRDN',
                    sortable: true,
                    resizable: true
                }
            ];
        },

        /**
         * Create column definition objects
         *
         * @method createColumnDefinitions
         * @param settings Output from Table Settings
         * @return {Array} Column Definition objects
         */
        createColumnDefinitions: function(settings) {
            var newColumns = [];
            for (var i = 0; i < settings.length; i++) {
                var column = settings[i];
                var newColumn = {
                    name: column.title,
                    value: column.attribute,
                    visible: column.visible,
                    width: column.width,
                    sortable: column.sortable
                };
                if (this.DEFAULT_ATTRIBUTES.indexOf(column.attribute) === -1) {
                    newColumn.cellType = ResultsCell;
                }
                newColumns.push(newColumn);
            }
            return newColumns;
        },

        getValueLengthOfACell: function(cellValue){
            var stringValue = cellValue + '';
            // valueLength is length of the value or 0 if the value is null or undefined.
            return cellValue === undefined || cellValue === null ? 0 : stringValue.length;
        },

        // set maxValueLength on the first argument (currentColumn)!
        setMaxValueLength: function (currentColumn, characterLength) {
            // if maxValueLength of this result is not present in columns or if it is shorter than valueLength
            if (!( 'maxValueLength' in currentColumn ) || (currentColumn.maxValueLength < characterLength)) {
                // assign valueLength to the maxValueLength
                currentColumn.maxValueLength = characterLength;
            }
        },

        // This function will take the response data from the server and give each column a max value
        giveMaxValueToColumnsBasedOnSingleDataObject: function(defaultColumns, singleObject) {
            // iterate based on default columns
            for (var j = 0; j < defaultColumns.length; j++) {

                var singleObjectAttributeValue = singleObject[defaultColumns[j].attribute];
                var singleObjectAttributeValueLength = this.getValueLengthOfACell(singleObjectAttributeValue);

                var currentDefaultColumn = defaultColumns[j];
                this.setMaxValueLength(currentDefaultColumn, singleObjectAttributeValueLength);
            }
        },
        // add to extraColumnNames{} argument if this key has not been added previously!
        // & give maxValue to extraColumnNames based on single data object!
        pushNamesForExtraColumns: function(extraColumnNames, singleObjectFromResponse) {
            // for each attribute of the singleObjectFromResponse!
            for (var attributeKey in singleObjectFromResponse.attributes) {
                if (singleObjectFromResponse.attributes.hasOwnProperty(attributeKey)) {
                    var attributeValue = singleObjectFromResponse.attributes[attributeKey];
                    var attributeValueLength = this.getValueLengthOfACell(attributeValue);

                    // If moTypeId is the same as the attribute key we ignore it and it is not place in the tabel
                    // For example MeContextId
                    // This is to ensure there are no duplicate columns
                    var ignoreAttributeKey = singleObjectFromResponse.moType + "Id" === attributeKey;

                    // Here we add new columns to extraColumnNames{} object declared at the beginning!
                    // Only add to extraColumnNames{} if this key has not been added previously!
                    if (!( attributeKey in extraColumnNames ) && !ignoreAttributeKey) {
                        extraColumnNames[attributeKey] = {};
                        // giveMaxValueToExtraColumnsBasedOnSingleDataObject
                        this.setMaxValueLength(extraColumnNames[attributeKey], attributeValueLength);
                    }
                }
            }
        },

        getExtraColumnsBasedOnNames: function(extraColumnNames){
            var extraColumns = [];
            for (var extraColAttributeKey in extraColumnNames) {
                if (extraColumnNames.hasOwnProperty(extraColAttributeKey)) {
                    var extraColumn = {
                        title: extraColAttributeKey,
                        attribute: extraColAttributeKey,
                        sortable: true,
                        cellType: ResultsCell
                    };
                    extraColumns.push(extraColumn);
                }
            }
            return extraColumns;
        },
        
        addWidthToColumns: function(columns) {
            for (var i = 0; i < columns.length; i++) {
                var maxValueLength = columns[i].maxValueLength;
                var titleLength = columns[i].title.length;
                var maxOverallLength = maxValueLength < titleLength ? titleLength : maxValueLength;

                if (maxOverallLength <= 8) {
                    columns[i].width = '100px';
                }
                else if (maxOverallLength >= 30) {
                    columns[i].width = '385px';
                }
                else  // when values are between 8 and 30 characters
                {
                    columns[i].width = (10 * (maxOverallLength + 2)) + 'px';
                }
            }
        },

        getColumnsFromResponseObject: function(responseData, attributes) {
            var defaultColumns = this.getDefaultColumns();
            var extraColumnNames = {};

            // DEFAULT COLUMNS!
            // for each result, add maxValueLength to defaultColumns
            // & push to extraColumnNames!
            for (var i = 0; i < responseData.length; i++) {
                var singleObjectFromResponse = responseData[i];

                this.giveMaxValueToColumnsBasedOnSingleDataObject(defaultColumns, singleObjectFromResponse);
                this.pushNamesForExtraColumns(extraColumnNames, singleObjectFromResponse);
            }
            this.addWidthToColumns(defaultColumns);

            // EXTRA COLUMNS
            var extraColumns = [];
            for (var j = 0; j < attributes.length; j++) {
                extraColumns.push({
                    title: attributes[j],
                    attribute: attributes[j],
                    sortable: true,
                    cellType: ResultsCell,
                    resizable: true
                });
            }
            for (var x = 0; x < responseData.length; x++) {
                var objectFromResponseArray = responseData[x];
                this.giveMaxValueToColumnsBasedOnSingleDataObject(extraColumns, objectFromResponseArray);
            }
            this.addWidthToColumns(extraColumns);

            return defaultColumns.concat(extraColumns);
        }
    };
});
