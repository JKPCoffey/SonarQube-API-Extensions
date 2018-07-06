/* global define */
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/SortableHeader',
    'widgets/Notification',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!sortable-table/dictionary.json'
], function (core, Table, SortableHeader, Notification, mockData, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                i18n: {
                    instruction: dictionary.get('table.sortInstruction')
                }
            });
        },

        onViewReady: function () {
            var data = buildMockData(),
                table = new Table({
                    data: data,
                    columns: [
                        // @formatter:off
                        {title: dictionary.get('table.continent'),   attribute: 'continent',   sortable: true, width: '150px'}, // sortable: true / false
                        {title: dictionary.get('table.country'),     attribute: 'country',     sortable: true, width: '150px'}, // Displays / hides the sorting arrows
                        {title: dictionary.get('table.city'),        attribute: 'city',        sortable: true, width: '150px'}, // on the header row
                        {title: dictionary.get('table.population'),  attribute: 'population',  sortable: true, width: '150px'},
                        {title: dictionary.get('table.description'), attribute: 'description', sortable: true}
                        // @formatter:on
                    ],
                    plugins: [
                        new SortableHeader({
                            multiSortLimit: 3,
                            multiSort: this.options.multiSort === true
                        })
                    ],
                    modifiers: [
                        {name: 'striped'} // Applying a different table style
                    ]
                }),
                element = this.getElement(),
                lastNotification;

            // The sortable plugin creates the "sort" event which triggers when clicking on the sort icons
            table.addEventHandler('sort', this.onTableSort.bind(this));
            table.addEventHandler('sort-limit-reached', function () {
                if (lastNotification !== undefined) {
                    lastNotification.destroy();
                }

                lastNotification = new Notification({
                    label: dictionary.get('table.sortLimitReached'),
                    icon: 'error',
                    color: 'red',
                    showAsToast: true,
                    autoDismissDuration: 3000
                });
                lastNotification.attachTo(element);
            });

            if (this.options.multiSort === true) {
                this.view.getNotification().removeModifier('hidden', 'eaSortableTable-wUserTable-notification');
            }

            table.attachTo(element);

            this.data = data;
            this.table = table;
        },

        onTableSort: function () {
            if (this.options.multiSort === true) {
                multiSort(this.data, arguments[0]);
            }
            else {
                simpleSort(this.data, arguments[0], arguments[1]);
            }

            this.table.setData(this.data);
        }
    });

    function simpleSort(data, mode, attribute) {
        var compareTo = getCompareTo(mode);

        data.sort(function (itemA, itemB) {
            return compareTo(itemA[attribute], itemB[attribute]);
        });
    }

    function multiSort(data, sorts) {
        var comparatorsByAttribute = {},
            sortsLen = sorts.length;
        // pre register the comparators in a map
        // to prevent creating the function at each iteration
        sorts.forEach(function (sort) {
            comparatorsByAttribute[sort.attribute] = getCompareTo(sort.mode);
        });

        data.sort(function (itemA, itemB) {
            for (var i = 0; i < sortsLen; i++) {
                var attribute = sorts[i].attribute,
                    comparator = comparatorsByAttribute[attribute],
                    compareRes = comparator(itemA[attribute], itemB[attribute]);

                if (compareRes !== 0) {
                    return compareRes;
                }
            }
            return 0;
        });
    }

    function getCompareTo(mode) {
        var sortOrder = mode === 'asc' ? 1 : -1;

        return function (valueA, valueB) {
            if (valueA === valueB) {
                return 0;
            }

            switch (typeof valueA) {
                case 'string':
                    return valueA.localeCompare(valueB) * sortOrder;
                case 'number':
                    return (valueA > valueB ? 1 : -1) * sortOrder;
            }
        };
    }

    function buildMockData() {
        var nameForSort = [
                buildDataItem('Europe', 'France', 'Bastia', 42254),
                buildDataItem('Europe', 'France', 'Bonifacio', 2872),
                buildDataItem('Europe', 'France', 'Bordeaux', 243626),
                buildDataItem('Europe', 'France', 'Caen', 107229),
                buildDataItem('Europe', 'France', 'Chambéry', 58653),
                buildDataItem('Europe', 'France', 'Marseille', 855393),
                buildDataItem('Europe', 'France', 'Montpellier', 272084),
                buildDataItem('Europe', 'France', 'Paris', 2229621),
                buildDataItem('Europe', 'France', 'Perpignan', 120959),
                buildDataItem('Europe', 'France', 'Valence', 61767),

                buildDataItem('Europe', 'Spain', 'Barcelona', 4251000),
                buildDataItem('Europe', 'Spain', 'Badajoz', 141000),
                buildDataItem('Europe', 'Spain', 'Bilbao', 947000),
                buildDataItem('Europe', 'Spain', 'Córdoba', 314000),
                buildDataItem('Europe', 'Spain', 'Madrid', 5263000),
                buildDataItem('Europe', 'Spain', 'Málaga', 844000),
                buildDataItem('Europe', 'Spain', 'Murcia', 623000),
                buildDataItem('Europe', 'Spain', 'Palma de Mallorca', 433000),
                buildDataItem('Europe', 'Spain', 'Pamplona', 286000),
                buildDataItem('Europe', 'Spain', 'Valladolid', 369000),

                buildDataItem('Europe', 'Poland', 'Bełchatów', 61496),
                buildDataItem('Europe', 'Poland', 'Białystok', 294143),
                buildDataItem('Europe', 'Poland', 'Bydgoszcz', 355645),
                buildDataItem('Europe', 'Poland', 'Chełm', 67782),
                buildDataItem('Europe', 'Poland', 'Chorzów', 113678),
                buildDataItem('Europe', 'Poland', 'Częstochowa', 242300),
                buildDataItem('Europe', 'Poland', 'Gdańsk', 462249),
                buildDataItem('Europe', 'Poland', 'Poznań', 542348),
                buildDataItem('Europe', 'Poland', 'Płock', 126968),
                buildDataItem('Europe', 'Poland', 'Warsaw', 1744351),

                buildDataItem('Europe', 'Portugal', 'Barcelos', 20000),
                buildDataItem('Europe', 'Portugal', 'Barreiro', 78764),
                buildDataItem('Europe', 'Portugal', 'Braga', 143532),
                buildDataItem('Europe', 'Portugal', 'Coimbra', 143396),
                buildDataItem('Europe', 'Portugal', 'Castelo Branco', 34525),
                buildDataItem('Europe', 'Portugal', 'Caldas da Rainha', 30006),
                buildDataItem('Europe', 'Portugal', 'Lisbon', 547631),
                buildDataItem('Europe', 'Portugal', 'Porto', 237559),
                buildDataItem('Europe', 'Portugal', 'Portimão', 45431),
                buildDataItem('Europe', 'Portugal', 'Vila Nova de Gaia', 186503),

                buildDataItem('South America', 'Paraguay', 'Asunción', 512112),
                buildDataItem('South America', 'Paraguay', 'Capiatá', 154274),
                buildDataItem('South America', 'Paraguay', 'Ciudad del Este', 222274),
                buildDataItem('South America', 'Paraguay', 'Lambaré', 119795),
                buildDataItem('South America', 'Paraguay', 'Luque', 170986),
                buildDataItem('South America', 'Paraguay', 'Mariano Roque Alonso', 65229),
                buildDataItem('South America', 'Paraguay', 'Minga Guazú', 14806),
                buildDataItem('South America', 'Paraguay', 'Pedro Juan Caballero', 64592),
                buildDataItem('South America', 'Paraguay', 'Pilar', 24300),
                buildDataItem('South America', 'Paraguay', 'San Lorenzo', 204356)
            ],
            loremDescriptions = mockData.generate({
                rows: nameForSort.length,
                attributes: {
                    description: 'lorem'
                }
            });

        nameForSort.forEach(function (d, index) {
            d.description = loremDescriptions[index].description;
        });

        return nameForSort;
    }

    function buildDataItem(continent, country, city, population) {
        return {
            continent: continent,
            country: country,
            city: city,
            population: population
        };
    }

});
