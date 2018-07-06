/*global define*/
define([
    'jscore/core',
    'template!./_userDetails.hbs',
    'styles!./_userDetails.less'
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
