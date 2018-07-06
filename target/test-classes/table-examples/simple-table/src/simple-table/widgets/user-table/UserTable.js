/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!simple-table/dictionary.json'
], function (core, Table, mockData, View, dictionary) {
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
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            };
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 10,
            attributes: {
                firstName: 'default',
                lastName: 'default',
                role: 'lorem'
            }
        });
    }

});
