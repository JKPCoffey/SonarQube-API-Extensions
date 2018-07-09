/*global define*/
define([
    'jscore/core',
    'text!./_levelCrumbs.html',
    'styles!./_levelCrumbs.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getList: function () {
            return this.getElement().find('.ebDrilldownPath');
        }
    });
});
