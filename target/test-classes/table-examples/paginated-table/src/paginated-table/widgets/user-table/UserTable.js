/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'widgets/Pagination',
    'widgets/SelectBox',
    '../../services/DataService',
    './UserTableView',
    'i18n!paginated-table/dictionary.json'
], function (core, Table, Pagination, SelectBox, dataService, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                header: dictionary.get('table.header')
            });
        },

        onViewReady: function () {
            this.createTable();
            this.createLimitSelect();

            this.loadData();
        },

        createTable: function () {
            this.table = new Table({
                data: [],
                columns: [
                    {title: dictionary.get('user.id'), attribute: 'id', width: '150px'},
                    {title: dictionary.get('user.firstName'), attribute: 'firstName'},
                    {title: dictionary.get('user.lastName'), attribute: 'lastName'},
                    {title: dictionary.get('user.role'), attribute: 'role'}
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            this.table.attachTo(this.view.getTable());
        },

        createLimitSelect: function () {
            this.limit = 10;

            var itemsStr = ' ' + dictionary.get('table.items'),
                limitSelect = new SelectBox({
                    value: {
                        name: this.limit + itemsStr,
                        value: this.limit,
                        title: this.limit + itemsStr
                    },
                    items: [this.limit, 25, 50, 75, 100].map(function (val) {
                        return {
                            name: val + itemsStr,
                            value: val,
                            title: val + itemsStr
                        };
                    }),
                    modifiers: [
                        {name: 'width', value: 'full'} // Applying a different table style
                    ]
                });

            limitSelect.addEventHandler('change', function () {
                this.limit = limitSelect.getValue().value;
                // as we change the limit in the page, reset the pagination position to the initial value
                this.currentIndex = 0;
                // reload the data with the new index / limit
                this.loadData(this.currentIndex, true);
            }.bind(this));

            limitSelect.attachTo(this.view.getLimitSelectHolder());
        },

        updatePagination: function (response) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil
            var pages = Math.ceil(response.length / this.limit);

            if (this.pagination === undefined) {
                this.pagination = new Pagination({
                    pages: pages,
                    selectedPage: this.currentIndex + 1
                });

                this.pagination.addEventHandler('pagechange', function (page) {
                    // the pagination is showing pages from 1 to X
                    // the load function takes pages from index 0
                    this.loadData(page - 1);
                }.bind(this));

                this.pagination.attachTo(this.view.getFooter());

                this.pages = pages;

                return;
            }

            if (this.pages !== pages) {
                this.pagination.setPages(pages);
                this.pagination.setPage(this.currentIndex + 1);
                this.pages = pages;
            }
        },

        loadData: function (index, force) {
            index = index !== undefined ? index : 0;

            if (this.currentIndex === index && !force) {
                return;
            }

            this.currentIndex = index;

            this.view.setLoadingDisplay(true);

            dataService.getData({
                offset: index * this.limit,
                limit: this.limit,
                success: function (response) {
                    this.updatePagination(response);
                    this.table.setData(response.data);
                    this.view.setLoadingDisplay(false);
                }.bind(this)
            });
        }
    });
});
