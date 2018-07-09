/*global define*/
define([
    'jscore/core',
    'template!./_userTable.hbs',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaSimpleTableSettings-wUserTable';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getTableSettingsBtn: function () {
            return this.getElement().find(__prefix + '-settingsButton');
        },

        getTable: function () {
            return this.getElement().find(__prefix + '-table');
        }
    });
});
