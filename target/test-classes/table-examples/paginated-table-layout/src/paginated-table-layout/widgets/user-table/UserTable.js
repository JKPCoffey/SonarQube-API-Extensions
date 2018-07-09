/*global define, Promise */
define([
    'jscore/core',
    'jscore/ext/utils',
    'i18n!paginated-table-layout/dictionary.json',
    'tablelib/layouts/PaginatedTable',
    'example-lib/utils/DateCellFactory',
    'example-lib/utils/BooleanCellFactory',
    '../../services/users',
    '../filter-form/FilterForm'
], function (core, coreUtils, dictionary, PaginatedTable, dateCellBuilder, booleanCellBuilder,
             usersService, FilterForm) {
    'use strict';

    var StatusCell = booleanCellBuilder.build({
            'true': dictionary.get('userTable.activated'),
            'false': dictionary.get('userTable.deactivated')
        }),
        DateCell = dateCellBuilder.build({format: 'DT'}),
        defaultColumns = [
            // @formatter:off
            {title: dictionary.get('userTable.username'),  attribute: 'username',  resizable: true, sortable: true, width: '110px', disableVisible: true},
            {title: dictionary.get('userTable.status'),    attribute: 'status',    resizable: true, sortable: true, width: '100px', cellType: StatusCell},
            {title: dictionary.get('userTable.firstName'), attribute: 'firstName', resizable: true, sortable: true, width: '125px'},
            {title: dictionary.get('userTable.lastName'),  attribute: 'lastName',  resizable: true, sortable: true, width: '125px'},
            {title: dictionary.get('userTable.role'),      attribute: 'role',      resizable: true, sortable: true},
            {title: dictionary.get('userTable.email'),     attribute: 'email',     resizable: true, sortable: true, width: '150px'},
            {title: dictionary.get('userTable.lastLogin'), attribute: 'lastLogin', resizable: true, sortable: true, width: '120px', cellType: DateCell}
            // @formatter:on
        ],
        tableConfigStorageKey = 'example:paginated-table-layout:config';

    return core.Widget.extend({

        onViewReady: function () {
            // load saved config if defined, or default
            var tableOptions = loadSavedConfig();

            // extend the config with required functions
            coreUtils.extend(tableOptions, {
                fetch: function (request) {
                    return usersService.get(request);
                },
                getAllIds: function () {
                    return usersService.get({fields: 'id'})
                        .then(function (itemIds) {
                            return itemIds.items.map(function (itemId) {
                                return itemId.id;
                            });
                        });
                },
                getTableFilterForm: function (filters) {
                    return new FilterForm({
                        // pass the existing filters to restore the form with the last filters applied
                        data: filters
                    });
                }
            });

            var table = new PaginatedTable(tableOptions);

            table.addEventHandler('select:change', function () {
                var userData = table.getSelectedIds();
                this.trigger('user:selected', userData);
            }.bind(this));

            table.addEventHandler('select:all', function () {
                var userData = table.getSelectedIds();
                this.trigger('user:selected', userData);
            }.bind(this));

            table.addEventHandler('column:resize', function (resizedColumn, columnsDef) {
                console.log('Column size changed:', resizedColumn, columnsDef);
                persistConfig(table.toJSON());
            });

            table.addEventHandler('table:sort', function (sortDir, sortAttr) {
                console.log('Column sorting changed:', sortDir, sortAttr);
                persistConfig(table.toJSON());
            });

            table.addEventHandler('table:settings', function (columnsDef) {
                console.log('Settings changed:', columnsDef);
                persistConfig(table.toJSON());
            });

            table.addEventHandler('table:filter', function (filters) {
                console.log('Table filter changed:', filters);
                persistConfig(table.toJSON());
            });

            table.addEventHandler('pageIndex:change', function (pageIndex) {
                console.log('Table pageIndex changed:', pageIndex);
                persistConfig(table.toJSON());
            });

            table.addEventHandler('pageSize:change', function (pageSize) {
                console.log('Table pageSize changed:', pageSize);
                persistConfig(table.toJSON());
            });

            table.attachTo(this.getElement());
            this.paginatedTable = table;
        },

        onDestroy: function () {
            this.paginatedTable.destroy();
        },

        deleteUsers: function (users) {
            usersService.delete(users);
            this.paginatedTable.refresh();
            this.trigger('user:selected', []);
        }
    });

    function loadSavedConfig() {
        // set on local storage for the example,
        // production application should store it server side
        var savedConfig = JSON.parse(localStorage.getItem(tableConfigStorageKey));

        if (savedConfig) {
            // function (cellType in this case) not persisted with stringify
            savedConfig.columns.forEach(function (col) {
                switch (col.attribute) {
                    case 'status':
                        col.cellType = StatusCell;
                        break;
                    case 'lastLogin':
                        col.cellType = DateCell;
                        break;
                }
            });
        }

        return savedConfig || {
            header: dictionary.get('userTable.header'),
            columns: defaultColumns
        };
    }

    function persistConfig(config) {
        // set on local storage for the example,
        // production application should store it server side
        localStorage.setItem(tableConfigStorageKey, JSON.stringify(config));
    }

});
