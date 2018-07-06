define([
    'jscore/core',
    './VirtualTableView',
    'tablelib/Table',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/VirtualScrolling',
    'tablelib/plugins/ResizableHeader',
    'jscore/ext/privateStore',
    'tablelib/plugins/StickyScrollbar'
], function(core, View, Table, VirtualSelection, VirtualScrolling, ResizableHeader, PrivateStore, StickyScrollbar) {

    var _ = PrivateStore.create();

    return core.Widget.extend({
        View: View,

        /**
         *
         * @options
         *   {Integer} totalRows - total number of rows in the table
         *   {Array} columns - columns to be displayed
         *   {Function} getData - fill
         *   {Function} getAllIds - fill
         *   {Function} getIds - fill
         *
         */
        init: function(options) {
            _(this).props = {
                totalRows: options.totalRows,
                columns: options.columns,
                getIds: options.getIds,
                getAllIds: options.getAllIds,
                getData: options.getData
            };
            _(this).table = this.createTable(_(this).props.totalRows);
        },

        onViewReady: function() {
            _(this).table.attachTo(this.getElement());
            _(this).table.addEventHandler('rowselectend', function(selectedRow) {
                this.onSelect(selectedRow);
            }.bind(this));
        },

        createTable: function(totalRows) {
            return new Table({
                plugins: [
                    new ResizableHeader(),
                    new StickyScrollbar(),
                    new VirtualScrolling({
                        totalRows: totalRows,
                        getData: this.getDataRequest.bind(this),
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new VirtualSelection({
                        checkboxes: false,
                        selectableRows: true,
                        multiselect: false,
                        preserveOrder: true,
                        bind: false,
                        getIds: function(id1, id2, success, error) {
                            _(this).props.getIds(id1, id2)//, tableConfig.sortAttr, tableConfig.sortMode)
                                .then(success)
                                .catch(error);
                        }.bind(this),
                        getAllIds: function(success, error) {
                            _(this).props.getAllIds()//tableConfig.sortAttr, tableConfig.sortMode)
                                .then(success)
                                .catch(error);
                        }.bind(this)
                    })
                ],
                modifiers: [
                    {name: 'striped'}
                ],
                tooltips: true,
                columns: _(this).props.columns
            });
        },

        getDataRequest: function(index, length, success, error) {
            // provide the service which sorting we expect
            // as well as the section of data to load
            // var sortAttr = this.tableConfig.sortAttr,
            //     sortMode = this.tableConfig.sortMode;

            _(this).table.getVirtualScrollBar().setAnnotationText(index+1 + ' - ' + (index+length));

            _(this).props.getData(index, length)//, sortAttr, sortMode)
                .then(function(data) {
                    // Check if the total length has changed, if so we need to update the height of the fake div
                    // if (data.length !== this.tableConfig.dataLength) {
                    //     _(this).table.setTotalRows(response.totalLength);
                    // }

                    success(data);
                }.bind(this))
                .catch(function(err) {
                    console.log(err);
                    error();
                });
        },

        setTotalRows: function() {
            _(this).table.setTotalRows.apply(_(this).table, arguments);
        },

        redraw: function() {
            _(this).table.redraw();
        },

        getSelectedIds: function() {
            return _(this).table.getSelectedIds();
        },

        addSelectedIds: function() {
            _(this).table.addSelectedIds.apply(_(this).table, arguments);
        },

        onSelect: function(rows) {
            var data = rows.map(function(row) {
                return row.getData();
            });
            this.trigger('virtualtable:selected', {viewPortData: data, allSelectedIds: this.getSelectedIds()});

        },

        getPosition: function() {
            return _(this).table.getVirtualScrollBar().getPosition();
        },

        setPosition: function(index) {
            return _(this).table.getVirtualScrollBar().setPosition(index);
        },

        getUnitsPerPage: function() {
            return _(this).table.getVirtualScrollBar().getUnitsPerPage();
        },

        setData: function(data) {
            _(this).table.setData(data);
        },

        showLoader: function(value) {
            _(this).table.showLoader(value);
        }
    });
});
