/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/FixedHeader',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!fixed-header-table/dictionary.json'
], function (core, Table, FixedHeader, mockData, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var tableW = new Table({
                data: buildMockData(),
                columns: [
                    {title: dictionary.get('table.firstName'), attribute: 'firstName'},
                    {title: dictionary.get('table.lastName'), attribute: 'lastName'},
                    {title: dictionary.get('table.role'), attribute: 'role'}
                ],
                plugins: [
                    new FixedHeader({maxHeight: '400px'})
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            tableW.attachTo(this.getElement());
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 100,
            attributes: {
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role'
            }
        });
    }

});
