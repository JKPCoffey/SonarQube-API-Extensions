/*global define*/
define([
    'jscore/core',
    'template!./_filterHeaderCell.html',
    'styles!./_filterHeaderCell.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaFilterableTableAdvanced-wFilterHeaderCell';

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

        getInputHolder: function () {
            return this.getElement().find(__prefix + '-inputHolder');
        },

        getInput: function () {
            return this.getElement().find(__prefix + '-input');
        },

        getDatePickerHolder: function () {
            return this.getElement().find(__prefix + '-datePicker');
        }
    });
});
