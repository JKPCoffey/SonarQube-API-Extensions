define([
    'jscore/core',
    'tablelib/Table',
    '../../ext/Constants',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/StickyScrollbar',
    'tablelib/plugins/VirtualScrolling',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/SmartTooltips',
    '../../widgets/customCell/CustomCell',
    'tablelib/plugins/SecondHeader',
    'i18n!cellmanagement/dictionary.json',
    /*'tablelib/plugins/PinColumns'*/
], function (core, Table, Constants, RowEvents, ResizableHeader, StickyScrollbar, VirtualScrolling, VirtualSelection, SmartTooltips, CustomCell, SecondHeader, Dictionary/*, PinColumns*/) {
    'use strict';

    return core.Widget.extend({
        // NOTE: This widget is intended to display a Table, but should not be used for any business logic
        // The containing Region should handle all data and logic

        init: function (options) {
            this.fdnsList = options.fdnsList;
            this.columns = options.columns;
            this.getVirtualScrollData = options.getDataFunction;
            this.tablePlaceHolder = options.tablePlaceHolder;
        },

        onViewReady: function () {
            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.redrawTable.bind(this));
        },

        onDestroy: function () {
            core.Window.removeEventHandler('resize', this.windowResizeEvtId);
            this.table.destroy();
        },

        // Initialize Table
        initCellsTable: function () {
            if (this.table) {
                this.table.destroy();
            }
            this.setFullHeight();
            this.columns.forEach(function (column) {
                if (column.attribute === Constants.customCellAttributes.administrativeState || column.attribute === Constants.customCellAttributes.operationalState || column.attribute === Constants.customCellAttributes.availabilityStatus) {
                    column.cellType = CustomCell;
                }
            });
            this.table = new Table({
                modifiers: [
                    {name: 'striped'}
                ],
                plugins: [
                    /*new PinColumns(),*/
                    new RowEvents({
                        events: ['contextmenu']
                    }),
                    new ResizableHeader({
                        showFillerColumn: true

                    }),
                    new VirtualScrolling({
                        totalRows: this.fdnsList.length,
                        getData: this.getVirtualScrollData,
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new StickyScrollbar(),
                    new VirtualSelection({
                        bind: true,
                        checkboxes: true,
                        selectableRows: true,
                        idAttribute: 'fdn',
                        multiselect: true,
                        getIds: getIds.bind(this),
                        getAllIds: getAllIds.bind(this)
                    }),
                    new SmartTooltips()
                ],
                columns: this.columns
            });

            this.table.attachTo(this.tablePlaceHolder);
        },

        initRelationsTable: function () {
            if (this.table) {
                this.table.destroy();
            }
            var plugins = {
                bind: true,
                checkboxes: true,
                selectableRows: true,
                idAttribute: 'fdn',
                multiselect: true,
                getIds: getIds.bind(this),
                getAllIds: getAllIds.bind(this)
            };
            if (this.options.ratType === Constants.ratTypes.lte) {
                if (this.options.tabName === Dictionary.lteRelations.wcdmaFrequencyRelation || this.options.tabName === Dictionary.lteRelations.lteFrequencyRelation || this.options.tabName === Dictionary.lteRelations.gsmGroupFrequencyRelation) {
                    plugins.checkboxes = false;
                    plugins.selectableRows =false;
                }
            }
            this.setFullHeight();
            this.table = new Table({
                modifiers: [
                    {name: 'striped'}
                ],
                plugins: [
                    new RowEvents({
                        events: ['contextmenu']
                    }),
                    new SecondHeader(),
                    new ResizableHeader({
                        showFillerColumn: true,
                        resizableSecondHeader: true
                    }),
                    new VirtualScrolling({
                        totalRows: this.fdnsList.length,
                        getData: this.getVirtualScrollData,
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new VirtualSelection(plugins),
                    new StickyScrollbar(),
                    new SmartTooltips({
                        enableSecondHeaderTooltip: true
                    })
                ],
                columns: this.columns
            });

            this.table.attachTo(this.tablePlaceHolder);
        },

        /**
         * Sets text to be displayed in the annotation of VirtualScrollBar
         */
        setAnnotationText: function (index, length) {
            this.table.getVirtualScrollBar().setAnnotationText((index + 1) + ' - ' + (index + length));
        },

        addEventHandler: function (event, callback) {
            this.table.addEventHandler(event, callback);
        },

        getRows: function () {
            return this.table.getRows();
        },

        getSelectedIds: function () {
            return this.table.getSelectedIds();
        },

        unselectAllIds: function () {
            return this.table.unselectAllIds();
        },

        addSelectedIds: function (ids) {
            return this.table.addSelectedIds(ids);
        },

        /**
         * Reloads the table
         */
        reload: function () {
            this.table.reload();
            this.redrawTable();
        },

        /**
         * Sets height of table depending on window size
         */
        setFullHeight: function () {
            var windowHeight = core.Window.getProperty('innerHeight'),
                element = this.tablePlaceHolder,
                eltPosition = element.getPosition();

            element.setStyle({height: (windowHeight - eltPosition.top - 3) + 'px'});
        },

        redrawTable: function () {
            this.setFullHeight();
            if (this.table) {
                this.table.redraw();
            }
        },

        resetTableRows: function (numberOfRows) {
            this.table.setTotalRows(numberOfRows);
        },

        getAllCellFdns: function () {
            return this.fdnsList.slice();
        }

    });

    /**
     * Used by the VirtualSelection plugin to select all rows
     * @param {Function} success - must be called with one argument: the list of all rows' FDN in the table
     */
    function getAllIds(success) {
        /*jshint validthis:true */
        // Copy the array so the copy can be modified without affecting the original array
        var copyOfCellFdns = this.fdnsList.slice();
        success(copyOfCellFdns);
    }

    /**
     * Used by the VirtualSelection plugin to select some rows
     * @param start - the FDN to start selecting at
     * @param end - the FDN to end selecting at
     * @param {Function} success - must be called with one argument: the list of rows' FDN in the table to be selected
     */
    function getIds(start, end, success) {
        /*jshint validthis:true */
        var indexA = this.fdnsList.indexOf(start);
        var indexB = this.fdnsList.indexOf(end);
        var response = this.fdnsList.slice(Math.min(indexA, indexB), Math.max(indexA, indexB) + 1);
        success(response);
    }
});
