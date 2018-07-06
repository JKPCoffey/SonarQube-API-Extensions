/*global define*/
define([
    'jscore/core',
    'template!./_userTable.hbs',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaQuickFilterTable-wUserTable';

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
        },

        getFilterBtn: function () {
            return this.getElement().find(__prefix + '-filter');
        },
        
        getFilterClear: function () {
            return this.getElement().find(__prefix + '-filterClear');
        },

        getFilterIcon: function () {
            return this.getElement().find(__prefix + '-filter .ebIcon');
        }

    });
});
