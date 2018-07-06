/*global define*/
define([
    'jscore/core',
    'template!./_userTable.hbs',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaPaginatedTable-wUserTable';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        setLoadingDisplay: function (display) {
            var table = this.getTable();

            if (display) {
                table.setModifier('loading'); // set the min-height to show the loader below the header
            }
            else {
                table.removeModifier('loading');
            }
        },

        getHeader: function () {
            return this.getElement().find(__prefix + '-header');
        },

        getLimitSelectHolder: function () {
            return this.getElement().find(__prefix + '-selectHolder');
        },

        getTable: function () {
            return this.getElement().find(__prefix + '-table');
        },

        getFooter: function () {
            return this.getElement().find(__prefix + '-footer');
        }
    });
});
