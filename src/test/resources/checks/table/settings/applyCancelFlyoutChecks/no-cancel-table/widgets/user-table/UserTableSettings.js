define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/TableSettings',
    'example-lib/utils/MockData',
    '../table-settings-form/TableSettingsForm',
    './UserTableView',
    'i18n!simple-table-settings/dictionary.json'
], 

	new TableSettings(),

	this.settingsForm.addEventHandler('apply',getApply())

);