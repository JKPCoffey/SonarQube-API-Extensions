/*global define*/
define([
    'jscore/core',
    'template!./_filterHeaderCell.hbs',
    'styles!./_filterHeaderCell.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFilterableTable-wFilterHeaderCell';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getFilterOptionsPlaceHolder: function () {
            return this.getElement().find(__prefix + '-options');
        },

        getInput: function () {
            return this.getElement().find(__prefix + '-input');
        }
    });
});
