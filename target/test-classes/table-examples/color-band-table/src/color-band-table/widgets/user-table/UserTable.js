/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ColorBand',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!color-band-table/dictionary.json'
], function (core, Table, ColorBand, mockData, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var table = new Table({
                data: buildMockData(),
                columns: [
                    {title: dictionary.get('user.firstName'), attribute: 'firstName', width: '250px'},
                    {title: dictionary.get('user.lastName'), attribute: 'lastName', width: '250px'},
                    {title: dictionary.get('user.status'), attribute: 'onlineStatus', width: '100px'},
                    {title: dictionary.get('user.role'), attribute: 'role'}
                ],
                plugins: [
                    new ColorBand({
                        color: function (row) {
                            return row.getData().color;
                        }
                    })
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            table.attachTo(this.getElement());
        }
    });

    function buildMockData() {
        var data = mockData.generate({
            rows: 10,
            attributes: {
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role',
                status: 'boolean'
            }
        });

        data.forEach(function (item) {
            item.color = item.status ? '#a1c845' : '#e94d47';   // green_80 / red_80
            item.onlineStatus = item.status ? dictionary.get('user.online') : dictionary.get('user.offline');
        });

        return data;
    }

});
