/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/PinColumns',
    'tablelib/plugins/ResizableHeader',
    'tablelib/TableSettings',
    'example-lib/utils/MockData',
    '../table-settings-form/TableSettingsForm',
    './UserTableView',
    'i18n!pinned-column-table/dictionary.json'
], function (core, Table, PinColumns, ResizableHeader, TableSettings, mockData, TableSettingsForm, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                header: dictionary.get('table.header'),
                settings: dictionary.get('table.settings')
            });
        },

        onViewReady: function () {
            this.generateTableData();
            this.createTable();
            this.view.getTableSettingsBtn().addEventHandler('click', this.onTableSettings.bind(this));
        },

        onTableSettings: function () {
            if (this.settingsForm === undefined) {
                this.tableSettings = new TableSettings({
                    selectDeselectAll: {
                        labels: dictionary.get('columnSelectionLabels')
                    },
                    columns: this.columns,
                    showPins: true
                });
                this.settingsForm = new TableSettingsForm({
                    content: this.tableSettings
                });

                this.settingsForm.addEventHandler('apply', function () {
                    this.trigger('table-settings:hide');
                    this.onTableSettingsChange();
                }.bind(this));

                this.settingsForm.addEventHandler('cancel', function () {
                    this.trigger('table-settings:hide');
                }.bind(this));
            }

            this.trigger('table-settings:show', {
                header: dictionary.get('table.settings'),
                content: this.settingsForm
            });
        },

        onTableSettingsChange: function () {
            this.createTable();
        },

        createTable: function () {
            if (this.table !== undefined) {
                this.table.destroy();
            }

            this.table = new Table({
                data: this.data,
                columns: this.tableSettings !== undefined ? this.tableSettings.getUpdatedColumns() : this.columns,
                plugins: [
                    new PinColumns(),
                    new ResizableHeader()
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            this.table.attachTo(this.view.getTable());
        },

        generateTableData: function () {
            this.data = buildMockData();
            this.columns = [
                {title: dictionary.get('user.id'), attribute: 'id', width: '150px', resizable: true, pinned: true, disableVisible: true},
                {title: dictionary.get('user.firstName'), attribute: 'firstName', width: '150px', resizable: true, pinned: true},
                {title: dictionary.get('user.lastName'), attribute: 'lastName', width: '150px', resizable: true, pinned: true},
                {title: dictionary.get('user.role'), attribute: 'role', width: '600px', resizable: true},
                {title: dictionary.get('user.status'), attribute: 'status', width: '600px', resizable: true}
            ];
        }
    });

    function buildMockData() {
        return mockData.generate({
            rows: 10,
            attributes: {
                id: 'id',
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role',
                status: 'lorem'
            }
        });
    }

});
