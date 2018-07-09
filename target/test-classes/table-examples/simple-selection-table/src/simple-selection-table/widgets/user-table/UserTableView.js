/*global define*/
define([
    'jscore/core',
    'template!./_userTable.hbs',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaSimpleSelectionTable-wUserTable';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getTable: function () {
            return this.getElement().find(__prefix + '-table');
        },

        getMessageHolder: function () {
            return this.getElement().find(__prefix + '-message');
        }
    });
});
