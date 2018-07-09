/*global define*/
define([
    'jscore/core',
    'template!./_drillDown.hbs',
    'styles!./_drillDown.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaDrilldownTable-wDrillDown';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getHeader: function () {
            return this.getElement().find(__prefix + '-header');
        },

        getTableHolder: function () {
            return this.getElement().find(__prefix + '-table');
        }
    });
});
