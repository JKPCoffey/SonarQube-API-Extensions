/*global define*/
define([
    'jscore/core',
    'text!./_userTable.html',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },
        getStyle: function () {
            return styles;
        }
    });
});
