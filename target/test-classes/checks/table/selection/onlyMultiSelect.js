/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/Selection',
    'widgets/InlineMessage',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!simple-selection-table/dictionary.json'
], function (core, Table, Selection,
             InlineMessage,
             mockData, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                header: dictionary.get('table.header')
            });
        },

        onViewReady: function () {
            var table = new Table({
                columns: [
                    {title: dictionary.get('user.firstName'), attribute: 'firstName', width: '250px'},
                    {title: dictionary.get('user.lastName'), attribute: 'lastName', width: '250px'},
                    {title: dictionary.get('user.role'), attribute: 'role'}
                ],
                plugins: [
                    new Selection({
                        multiselect: true,
                        bind: true
                    })
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            table.addEventHandler('rowselectend', this.onTableSelect.bind(this));
            table.attachTo(this.view.getTable());

            this.table = table;
            this.setData(buildMockData());
        },

        onTableSelect: function (selectedItems) {
            var userData = selectedItems.map(function (item) {
                return item.getData();
            });
            this.trigger('user:selected', userData);
        },

        setData: function (data) {
            if (this.emptyTable === true) {
                this.table.attachTo(this.view.getTable());
                this.infoMessage.destroy();

                delete this.emptyTable;
                delete this.infoMessage;
            }

            this.table.setData(data);
            this.data = data;

            if (data.length === 0 && this.infoMessage === undefined) {
                this.emptyTable = true;
                this.table.detach();
                this.infoMessage = new InlineMessage({
                    header: dictionary.get('table.noData.header'),
                    description: dictionary.get('table.noData.message')
                });
                this.infoMessage.attachTo(this.view.getMessageHolder());
            }
        },

        deleteUsers: function (users) {
            var data = this.data.filter(function (item) {
                var indexOfItem = users.indexOf(item);

                if (indexOfItem !== -1) {
                    users.splice(indexOfItem, 1);
                    return false;
                }

                return true;
            });

            this.setData(data);

            this.trigger('user:selected', []);
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 10,
            attributes: {
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role'
            }
        });
    }

});
