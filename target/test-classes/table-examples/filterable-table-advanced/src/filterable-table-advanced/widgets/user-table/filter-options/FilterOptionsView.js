/*global define*/
define([
    'jscore/core',
    'text!./_filterOptions.html',
    'styles!./_filterOptions.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        setSelected: function (value) {
            this.getElement().setText(value);
        },

        getSelected: function () {
            return this.getElement().getText();
        }
    });
});
