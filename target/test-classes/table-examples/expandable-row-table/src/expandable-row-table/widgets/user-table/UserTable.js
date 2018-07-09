/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ExpandableRows',
    'tablelib/plugins/Selection',
    'example-lib/utils/MockData',
    './custom-row-content/CustomRowContent',
    './UserTableView',
    'i18n!expandable-row-table/dictionary.json'
], function (core, Table, ExpandableRows, Selection, mockData, CustomRowContent, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var tableOptions = this.buildTableOptions(),
                tableW = new Table(tableOptions);

            tableW.attachTo(this.getElement());
        },

        buildTableOptions: function () {
            return {
                data: buildMockData(),
                columns: [
                    {title: dictionary.get('table.firstName'), attribute: 'firstName'},
                    {title: dictionary.get('table.lastName'), attribute: 'lastName'},
                    {title: dictionary.get('table.role'), attribute: 'role'}
                ],
                plugins: [
                    new ExpandableRows({
                        content: CustomRowContent,
                        args: {
                            keyToLabel: [
                                {key: 'firstName', label: dictionary.get('table.firstName')},
                                {key: 'lastName', label: dictionary.get('table.lastName')},
                                {key: 'role', label: dictionary.get('table.role')},
                                {key: 'dob', label: dictionary.get('table.dob')},
                                {key: 'description', label: dictionary.get('table.description')}
                            ]
                        }
                    }),
                    new Selection({
                        checkboxes: true,
                        selectableRows: true,
                        multiselect: true,
                        bind: true
                    })
                ],
                modifiers: [
                    {name: 'expandableStriped'} // Applying a different table style
                ]
            };
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 10,
            attributes: {
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role',
                dob: 'date',
                description: 'lorem'
            }
        });
    }
});
