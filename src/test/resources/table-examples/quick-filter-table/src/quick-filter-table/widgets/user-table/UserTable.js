/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/StickyHeader',
    'tablelib/plugins/QuickFilter',
    'tablelib/plugins/SmartTooltips',
    'widgets/InlineMessage',
    'example-lib/utils/MockData',
    'example-lib/utils/DateCellFactory',
    'example-lib/utils/BooleanCellFactory',
    './UserTableView',
    'i18n!quick-filter-table/dictionary.json'
], function (core, Table,
             ResizableHeader, StickyHeader, QuickFilter, SmartTooltips,
             InlineMessage,
             mockData, dateCellBuilder, booleanCellBuilder, View, dictionary) {
    'use strict';

    var filterTypeMapping = {
        id: 'string',
        firstName: 'string',
        lastName: 'string',
        role: 'array-of-string',
        status: 'boolean',
        registration: 'date'
    };

    return core.Widget.extend({

        view: function () {
            return new View({
                title: dictionary.get('table.title'),
                filtersApplied: dictionary.get('table.filter.filtersApplied'),
                clear: dictionary.get('table.filter.clear'),
                toggleFilter: dictionary.get('table.toggleFilter')
            });
        },

        onViewReady: function () {
            initializeFilterEvents.call(this);

            var data = buildMockData.call(this),
                textFilter = {
                    type: 'text',
                    options: {
                        submitOn: 'input',
                        submitDelay: 250,
                        placeholder: dictionary.get('table.typeToFilter')
                    }
                },
                table = new Table({
                    data: data,
                    columns: [{
                        title: dictionary.get('user.id'),
                        attribute: 'id',
                        width: '100px',
                        filter: textFilter
                    }, {
                        title: dictionary.get('user.firstName'),
                        attribute: 'firstName',
                        width: '250px',
                        resizable: true,
                        filter: textFilter
                    }, {
                        title: dictionary.get('user.lastName'),
                        attribute: 'lastName',
                        width: '250px',
                        resizable: true,
                        filter: textFilter
                    }, {
                        title: dictionary.get('user.registration'),
                        attribute: 'registration',
                        width: '125px',
                        resizable: true,
                        cellType: dateCellBuilder.build({format: 'D'}),
                        filter: {
                            type: 'date'
                        }
                    }, {
                        title: dictionary.get('user.status'),
                        attribute: 'status',
                        width: '100px',
                        resizable: true,
                        cellType: booleanCellBuilder.build({
                            'true': dictionary.get('status.active'),
                            'false': dictionary.get('status.restricted')
                        }),
                        filter: {
                            type: 'select',
                            options: {
                                value: {name: dictionary.get('status.all'), value: undefined},
                                items: [
                                    {name: dictionary.get('status.all'), value: undefined},
                                    {name: dictionary.get('status.active'), value: true},
                                    {name: dictionary.get('status.restricted'), value: false}
                                ]
                            }
                        }
                    }, {
                        title: dictionary.get('user.role'),
                        attribute: 'role',
                        resizable: true,
                        filter: {
                            type: 'multi-select',
                            options: {
                                items: [
                                    {name: 'Administrator Role', value: 'Administrator Role'},
                                    {name: 'ENodeB_Application_Administrator', value: 'ENodeB_Application_Administrator'},
                                    {name: 'Field Technician', value: 'Field Technician'}
                                ]
                            }
                        }
                    }],
                    plugins: [
                        new ResizableHeader(),
                        new SmartTooltips(),
                        new StickyHeader({topOffset: 32}),
                        new QuickFilter()
                    ],
                    modifiers: [
                        {name: 'striped'} // Applying a different table style
                    ]
                });

            table.addEventHandler('filter:change', this.onTableFilter.bind(this));
            table.attachTo(this.view.getTable());

            this.data = data;
            this.table = table;
            this.infoMessage = new InlineMessage({
                header: dictionary.get('table.noData.header'),
                description: dictionary.get('table.noData.message')
            });
        },

        onTableFilter: function (filters) {
            console.log('table filter change', filters);

            var filterArr = preProcessFiltersData(filters),
                data = filterData(filterArr, this.data),
                filtersApplied = areFiltersApplied(filters)
            ;

            if (filtersApplied) {
                this.getElement().setModifier('filtered');
            }
            else {
                this.getElement().removeModifier('filtered');
            }

            this.table.setData(data);

            if (data.length === 0) {
                this.infoMessage.attachTo(this.view.getMessageHolder());
            }
            else {
                this.infoMessage.detach();
            }
        }

    });

    function initializeFilterEvents() {
        /* jshint validthis:true */
        var filterIcon = this.view.getFilterIcon(),
            filtersEnabled = false;

        this.view.getFilterClear().addEventHandler('click', resetFilters.bind(this));

        this.view.getFilterBtn().addEventHandler('click', function () {
            filtersEnabled = !filtersEnabled;
            filterIcon.removeModifier(filtersEnabled ? 'filterOff' : 'filterOn', 'ebIcon');
            filterIcon.setModifier(filtersEnabled ? 'filterOn' : 'filterOff', '', 'ebIcon');

            this.table[filtersEnabled ? 'showFilter' : 'hideFilter']();
        }.bind(this));
    }

    /**
     * returns true is at least one value is not the default value
     * @param filters
     * @returns {Boolean}
     */
    function areFiltersApplied(filters) {
        return Object.keys(filters).some(function (key) {
            switch (key) {
                case 'id':
                case 'firstName':
                case 'lastName':
                    return filters[key] !== '';
                case 'registration':
                    return filters.registration !== undefined;
                case 'status':
                    return filters.status.value !== undefined;
                case 'role':
                    return filters.role.length !== 0;
            }
        });
    }

    function buildMockData() {
        return mockData.generate({
            rows: 100,
            attributes: {
                id: 'signum',
                firstName: 'firstName',
                lastName: 'lastName',
                registration: 'date',
                status: 'boolean',
                role: 'role'
            }
        });
    }

    function preProcessFiltersData(filters) {
        return Object.keys(filters).map(function (key) {
            var value;

            switch (key) {
                case 'registration':
                    value = filters.registration ? filters.registration.getTime() : undefined;
                    break;
                case 'role':
                    value = filters.role.length === 0 ? undefined : filters.role.map(function (d) {
                        return d.value;
                    });
                    break;
                case 'status':
                    value = filters.status.value;
                    break;
                default:
                    value = filters[key];
            }

            return {
                name: key,
                value: value
            };
        });
    }

    function filterData(filterArr, data) {
        filterArr.forEach(function (filter) {
            var attr = filter.name,
                filterValue = filter.value,
                type = filterTypeMapping[attr];

            if (filterValue === undefined || filterValue === '') {
                return;
            }

            // reduce the data set by applying the successive filters
            data = data.filter(function (item) {
                var value = item[attr];
                switch (type) {
                    case 'string':
                        return compareString(filterValue, value);
                    case 'date':
                        return compareDate(filterValue, value);
                    case 'boolean':
                        return compareBoolean(filterValue, value);
                    case 'array-of-string':
                        return isArrayItemIsInString(filterValue, value);
                }
            });
        });

        return data;
    }

    function resetFilters() {
        /* jshint validthis:true */
        this.table.setFilters({
            id: '',
            firstName: '',
            lastName: '',
            role: [],
            status: {name: dictionary.get('status.all'), value: undefined},
            registration: undefined
        }, false);
    }

    //-----------------------------------------------------

    function compareString(filterValue, itemValue) {
        return itemValue.toLocaleLowerCase().indexOf(filterValue.toLocaleLowerCase()) !== -1;
    }

    function isArrayItemIsInString(filterValue, itemValue) {
        return filterValue.some(function (d) {
            return itemValue.indexOf(d) !== -1;
        });
    }

    function compareDate(filterValue, itemValue) {
        var input = new Date(filterValue);
        itemValue = new Date(itemValue);
        return input.getDate() === itemValue.getDate() &&
            input.getMonth() === itemValue.getMonth() &&
            input.getFullYear() === itemValue.getFullYear();
    }

    function compareBoolean(filterValue, itemValue) {
        return filterValue === itemValue;
    }

});
