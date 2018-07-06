/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/StickyHeader',
    'tablelib/plugins/SecondHeader',
    'widgets/InlineMessage',
    'example-lib/utils/MockData',
    'example-lib/utils/DateCellFactory',
    './cells/filter-header-cell/FilterHeaderCell',
    './UserTableView',
    'i18n!filterable-table-advanced/dictionary.json'
], function (core, Table, StickyHeader, SecondHeader,
             InlineMessage,
             mockData, dateCellBuilder, FilterHeaderCell, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var data = buildMockData(),
                table = new Table({
                    data: data,
                    columns: [{
                        title: dictionary.get('user.id'),
                        attribute: 'id',
                        attributeType: 'number',
                        secondHeaderCellType: FilterHeaderCell
                    }, {
                        title: dictionary.get('user.firstName'),
                        attribute: 'firstName',
                        attributeType: 'string',
                        secondHeaderCellType: FilterHeaderCell
                    }, {
                        title: dictionary.get('user.lastName'),
                        attribute: 'lastName',
                        attributeType: 'string',
                        secondHeaderCellType: FilterHeaderCell
                    }, {
                        title: dictionary.get('user.dob'),
                        attribute: 'dob',
                        attributeType: 'date',
                        width: '210px',
                        cellType: dateCellBuilder.build({format: 'D'}),
                        secondHeaderCellType: FilterHeaderCell
                    }, {
                        title: dictionary.get('user.status'),
                        attribute: 'status',
                        attributeType: 'boolean',
                        secondHeaderCellType: FilterHeaderCell
                    }],
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

        onTableFilter: function (attribute, value, comparator, type) {
            this.activeFilters[attribute] = {
                value: value,
                comparator: comparator,
                type: type
            };

            var data = this.filterData(this.activeFilters, this.data);
            this.table.setData(data);

            if (data.length === 0) {
                this.infoMessage.attachTo(this.view.getMessageHolder());
            }
            else {
                this.infoMessage.detach();
            }
        },

        filterData: function (filters, data) {

            Object.keys(filters).forEach(function (attr) {
                var attributeFilter = filters[attr],
                    type = attributeFilter.type;

                if (filters[attr].value === undefined || filters[attr].value === '') {
                    return;
                }

                // reduce the data set by applying the successive filters
                data = data.filter(function (item) {
                    var value = item[attr];
                    switch (type) {
                        case 'number':
                            return compareNumber(attributeFilter, value);
                        case 'string':
                            return compareString(attributeFilter, value);
                        case 'date':
                            return compareDate(attributeFilter, value);
                        case 'boolean':
                            return compareBoolean(attributeFilter, value);
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
                id: 'signum',
                firstName: 'firstName',
                lastName: 'lastName',
                dob: 'date',
                status: 'boolean'
            }
        });
    }

    function compareString(filter, value) {
        var lowerCaseValue = value.toLocaleLowerCase(),
            lowerCaseFilterValue = filter.value.toLocaleLowerCase();

        switch (filter.comparator) {
            case '=':
                return lowerCaseValue === lowerCaseFilterValue;
            case '!=':
                return lowerCaseValue !== lowerCaseFilterValue;
            // starts with
            case 'abc*':
                return new RegExp('^(' + lowerCaseFilterValue + ').*', 'i').test(lowerCaseValue);
            // contains
            case '*abc*':
                return new RegExp('.*(' + lowerCaseFilterValue + ').*', 'i').test(lowerCaseValue);
            // ends width
            case '*abc':
                return new RegExp('.*(' + lowerCaseFilterValue + ')$', 'i').test(lowerCaseValue);
        }
    }

    function compareNumber(filter, value) {
        var itemValue = parseFloat(value),
            filterValue = parseFloat(filter.value);

        switch (filter.comparator) {
            case '=':
                return itemValue === filterValue;
            case '!=':
                return itemValue !== filterValue;
            case '>':
                return itemValue > filterValue;
            case '<':
                return itemValue < filterValue;
        }
    }

    function compareDate(filter, value) {
        switch (filter.comparator) {
            case '>':
                return value > filter.value;
            case '<':
                return value < filter.value;
            case '=':
                var input = new Date(filter.value);
                value = new Date(value);
                return input.getDate() === value.getDate() &&
                    input.getMonth() === value.getMonth() &&
                    input.getFullYear() === value.getFullYear();
        }
    }

    function compareBoolean(filter, value) {
        switch (filter.comparator) {
            case '=':
                return value === filter.value;
            case '!=':
                return value !== filter.value;
        }
    }
});
