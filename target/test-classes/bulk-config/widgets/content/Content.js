define([
    'jscore/core',
    './ContentView',
    'i18n!bulkimportlib/dictionary.json',
    'tablelib/Table',
    'tablelib/plugins/ExpandableRows',
    './customcontent/CustomContent',
    'tablelib/plugins/NoHeader',
    './customcells/statusinfo/StatusInfo',
    './customcells/fdncell/FdnCell',
    'tablelib/plugins/SmartTooltips',
    '../../utils/Constants',
    '../../utils/DisplayFormatUtil'
], function(core, View, dictionary, Table, ExpandableRows, CustomRowContent, NoHeader, StatusInfo, FdnCell, SmartTooltips, Constants, DisplayFormatUtil) {
    'use strict';
    return core.Widget.extend({

        View: View,

        init: function(data) {
            this.data = data;
        },

        onViewReady: function() {
            if (this.table) {
                this.table.destroy();
            }
            this.table = new Table({
                plugins: [
                    new ExpandableRows({
                        content: CustomRowContent
                    }),
                    new NoHeader(),
                    new SmartTooltips()
                ],
                modifiers: [{
                    name: 'expandableStriped'
                }],
                columns: [{
                    title: dictionary.get('actionHeader'),
                    attribute: 'action',
                    width: '80px',
                    visible: true,
                    cellType: StatusInfo
                }, {
                    title: dictionary.get('fdn'),
                    attribute: 'fdn',
                    visible: true,
                    cellType: FdnCell
                }],
                data: this.prepareTableData()
            });

            this.table.attachTo(this.view.getTableHolder());
        },

        onDOMAttach: function() {
            this.table.getRows().forEach(function(row) {
                row.expand(false);
            });
        },

        addRows: function(data) {
            this.data = data;
            this.data = this.prepareTableData();
            var rows;
            this.data.map(function(currRow) {
                this.table.addRow(currRow);
                rows = this.table.getRows();
                rows[rows.length-1].expand(false);
            }.bind(this));
        },

        prepareTableData: function() {
            var tableData = [];
            this.validEditedPOIds = this.filterValidEditedPOIds();
            for (var i = 0; i < this.validEditedPOIds.length; i++) {
                var poIdVal = this.data[this.validEditedPOIds[i]];
                var rowData = {}, details = {};
                if (poIdVal.isExecuted && poIdVal.isExecuted !== undefined) {
                    rowData.action = poIdVal.action + '|' + poIdVal.isExecuted;
                } else {
                    rowData.action = poIdVal.action;
                }
                rowData.isExecuted = poIdVal.isExecuted;
                rowData.errorMsg = poIdVal.errorMsg;
                for (var item in poIdVal) {
                    if (Constants.MODATA.indexOf(item) === -1) {
                        //cloning the object so the modifiedValue is not formatted in the Rest call
                        details[item] = JSON.parse(JSON.stringify(poIdVal[item]));
                        DisplayFormatUtil.formatValuesBasedOnType(details[item]);
                        if (details[item].currentValue) {
                            details[item].currentValue = DisplayFormatUtil.formatAttrValues(details[item].currentValue);
                        }
                    }
                }
                rowData.actionName = poIdVal.actionName;
                rowData.fdn = poIdVal.fdn;
                rowData.details = details;
                tableData.push(rowData);
            }
            return tableData;
        },

        filterValidEditedPOIds: function() {
            var validEditedPOIds = [];
            for (var poId in this.data) {
                if (this.data[poId].isError === false) {
                    validEditedPOIds.push(poId);
                }
            }
            return validEditedPOIds;
        }
    });
});
