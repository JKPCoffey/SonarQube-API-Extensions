define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/TableSettings',
    'example-lib/utils/MockData',
    '../table-settings-form/TableSettingsForm',
    './UserTableView',
    'i18n!simple-table-settings/dictionary.json'
], function (core, Table, TableSettings, mockData, TableSettingsForm, View, dictionary) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            var userTable = new UserTable();
            
            new TableSettings();

            appLayout.initializeTopSection.call(this, {
            });
        }
    });
});