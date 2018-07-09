/*global define*/
define([
    'jscore/core',
    'template!./_applicationList.hbs',
    'styles!./_applicationList.less'
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
