/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'example-lib/utils/MockData',
    './cells/date-cell/DateCell',
    './cells/icon-cell/IconCell',
    './UserTableView',
    'i18n!custom-cell-table/dictionary.json'
], function (core, Table, mockData, DateCell, IconCell, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var table = new Table({
                data: buildMockData(),
                columns: [
                    {title: dictionary.get('table.firstName'), attribute: 'firstName'},
                    {title: dictionary.get('table.lastName'), attribute: 'lastName'},
                    {title: dictionary.get('table.dob'), attribute: 'dob', width: '150px', cellType: DateCell},
                    {title: dictionary.get('table.status'), attribute: 'status', cellType: IconCell}
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            table.attachTo(this.getElement());
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 10,
            attributes: {
                firstName: 'default',
                lastName: 'default',
                dob: 'date',
                status: 'boolean'
            }
        });
    }

});
