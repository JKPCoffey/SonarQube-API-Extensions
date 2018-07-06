define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/TableSettings',
    'example-lib/utils/MockData',
    '../table-settings-form/TableSettingsForm',
    './UserTableView',
    'i18n!simple-table-settings/dictionary.json'
]);

this.settingsForm.addEventHandler('apply', function () {
                    this.trigger('table-settings:hide');
                    this.onTableSettingsChange();
                }.bind(this));

this.settingsForm.addEventHandler('cancel', function () {
    this.trigger('table-settings:hide');
}.bind(this));