/*global define*/
define([
    'jscore/core',
    'template!./_appDetails.hbs',
    'styles!./_appDetails.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        }
    });
});
