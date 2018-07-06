/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ColorBand',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/VirtualScrolling',
    'tablelib/plugins/ResizableHeader',
    '../../services/DataService',
    './UserTableView',
    'i18n!virtual-scroll-table/dictionary.json'
], function (core, Table, ColorBand, VirtualSelection, SortableHeader, VirtualScrolling, ResizableHeader, dataService, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                header: dictionary.get('table.header')
            });
        },

        init: function () {
            this.tableConfig = {
                sortMode: 'asc',
                sortAttr: 'id',
                columns: [
                    {title: dictionary.get('user.id'), attribute: 'id', width: '150px', sortable: true},
                    {title: dictionary.get('user.firstName'), attribute: 'firstName', sortable: true, resizable: true},
                    {title: dictionary.get('user.lastName'), attribute: 'lastName', sortable: true, resizable: true},
                    {title: dictionary.get('user.role'), attribute: 'role', sortable: true, resizable: true}
                ]
            };
        },

        onViewReady: function () {
            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.setFullHeight.bind(this));
        },

        onDestroy: function () {
            core.Window.removeEventHandler(this.windowResizeEvtId);
        },

        onDOMAttach: function () {
            this.initializeTable();
        },

        setFullHeight: function () {
            var windowHeight = core.Window.getProperty('innerHeight'),
                element = this.getElement(),
                eltPosition = element.getPosition();

            element.setStyle({height: (windowHeight - eltPosition.top ) + 'px'});

            if (this.table) {
                this.table.redraw();
            }
        },

        onError: function (err) {
            // handle error message here
            console.error(err);
        },

        initializeTable: function () {
            dataService.getDataLength()
                .then(function (len) {
                    this.tableConfig.dataLength = len;
                    this.createTable();
                }.bind(this))
                .catch(this.onError.bind(this));
        },

        createTable: function () {
            var tableConfig = this.tableConfig;

            this.table = new Table({
                columns: tableConfig.columns,
                plugins: [
                    new SortableHeader(),
                    new VirtualScrolling({
                        totalRows: tableConfig.dataLength,
                        getData: this.getDataRequest.bind(this),
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new VirtualSelection({
                        bind: true,
                        checkboxes: true,
                        multiselect: true,
                        selectableRows: true,
                        getIds: function (start, end, success, error) {
                            dataService.getIds(start, end, tableConfig.sortAttr, tableConfig.sortMode)
                                .then(success)
                                .catch(error);
                        },
                        getAllIds: function (success, error) {
                            dataService.getAllIds(tableConfig.sortAttr, tableConfig.sortMode)
                                .then(success)
                                .catch(error);
                        }
                    }),
                    new ResizableHeader()
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            this.table.setSortIcon(tableConfig.sortMode, tableConfig.sortAttr);

            // Listen for the sort event
            this.table.addEventHandler('sort', function (sortMode, sortAttr) {

                // Set the new sort options
                tableConfig.sortAttr = sortAttr;
                tableConfig.sortMode = sortMode;

                // set scroll in the fake div to the top
                this.table.getVirtualScrollBar().setPosition(0);
                this.table.reload();
            }.bind(this));

            this.table.attachTo(this.view.getTable());
        },

        getDataRequest: function (index, length, callback) {
            // provide the service which sorting we expect
            // as well as the section of data to load
            var sortAttr = this.tableConfig.sortAttr,
                sortMode = this.tableConfig.sortMode;

            dataService.loadData(index, length, sortAttr, sortMode)
                .then(function (response) {
                    // Check if the total length has changed, if so we need to update the height of the fake div
                    if (response.totalLength !== this.tableConfig.dataLength) {
                        this.table.setTotalRows(response.totalLength);
                        this.tableConfig.dataLength = response.totalLength;
                    }

                    var resData = response.data;

                    // Change message in annotated scroll bar
                    if (resData[0] !== undefined) {
                        var start = resData[0][sortAttr],
                            end = resData[resData.length - 1][sortAttr];

                        if (typeof start === 'string') {
                            // truncate long text to the relevant part for usability
                            start = start.substr(0, 20);
                            end = end.substr(0, 20);
                        }

                        this.table.getVirtualScrollBar().setAnnotationText(dictionary.get('user.' + sortAttr) + ': ' + start + ' - ' + end);
                    }

                    callback(resData);
                }.bind(this))
                .catch(this.onError.bind(this));
        }
    });
});
