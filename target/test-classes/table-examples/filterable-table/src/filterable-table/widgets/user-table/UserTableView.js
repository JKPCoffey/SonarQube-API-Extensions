/*global define*/
define([
    'jscore/core',
    'text!./_userTable.html',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFilterableTable-wUserTable';

    return core.View.extend({

        getTemplate: function () {
            return template;
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
