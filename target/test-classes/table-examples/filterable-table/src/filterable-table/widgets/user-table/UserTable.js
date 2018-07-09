/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/StickyHeader',
    'tablelib/plugins/SecondHeader',
    'widgets/InlineMessage',
    'example-lib/utils/MockData',
    './cells/filter-header-cell/FilterHeaderCell',
    './UserTableView',
    'i18n!filterable-table/dictionary.json'
], function (core, Table, StickyHeader, SecondHeader,
             InlineMessage,
             mockData, FilterHeaderCell, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var colLabel = dictionary.get('table.column') + ' ',
                i = 1,
                data = buildMockData(),
                table = new Table({
                    data: data,
                    columns: [
                        {title: colLabel + i++, attribute: 'column_1', secondHeaderCellType: FilterHeaderCell},
                        {title: colLabel + i++, attribute: 'column_2', secondHeaderCellType: FilterHeaderCell},
                        {title: colLabel + i++, attribute: 'column_3', secondHeaderCellType: FilterHeaderCell},
                        {title: colLabel + i++, attribute: 'column_4', secondHeaderCellType: FilterHeaderCell},
                        {title: colLabel + i, attribute: 'column_5', secondHeaderCellType: FilterHeaderCell}
                    ],
                    plugins: [
                        new StickyHeader({
                            topOffset: 32
                        }),
                        new SecondHeader()
                    ],
                    modifiers: [
                        {name: 'striped'} // Applying a different table style
                    ]
                });

            table.addEventHandler('filter', this.onTableFilter.bind(this));

            table.attachTo(this.view.getTable());

            this.activeFilters = {};
            this.data = data;
            this.table = table;
            this.infoMessage = new InlineMessage({
                header: dictionary.get('table.noData.header'),
                description: dictionary.get('table.noData.message')
            });
        },

        onTableFilter: function (attribute, value, comparator) {
            this.activeFilters[attribute] = {value: value, comparator: comparator};

            var data = this.filterData(this.activeFilters, this.data);
            this.table.setData(data);

            if (data.length === 0) {
                this.infoMessage.attachTo(this.view.getMessageHolder());
            }
            else {
                this.infoMessage.detach();
            }
        },

        /**
         * Filter the data passed as param based on the filters provided
         * @param filters filters to apply
         * @param data data to sort
         */
        filterData: function (filters, data) {

            Object.keys(filters).forEach(function (attr) {
                var attributeFilter = filters[attr];

                // reduce the data set by applying the successive filters
                data = data.filter(function (item) {

                    // undefined or empty string, return true
                    if (attributeFilter.value) {
                        var filterVal = parseFloat(attributeFilter.value);

                        switch (attributeFilter.comparator) {
                            case '=':
                                return item[attr].toString() === attributeFilter.value;
                            case '>':
                                return item[attr] > filterVal;
                            case '<':
                                return item[attr] < filterVal;
                            case '!=':
                                return item[attr] !== filterVal;
                        }
                    }
                    else {
                        return true;
                    }
                });
            });

            return data;
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 100,
            attributes: {
                column_1: 'randomInt',
                column_2: 'randomInt',
                column_3: 'randomInt',
                column_4: 'randomInt',
                column_5: 'randomInt'
            }
        });
    }
});
