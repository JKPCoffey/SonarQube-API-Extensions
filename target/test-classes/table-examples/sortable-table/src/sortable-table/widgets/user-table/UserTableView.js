/*global define*/
define([
    'jscore/core',
    'template!./_userTable.hbs',
    'styles!./_userTable.less'
], function (core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getNotification: function () {
            return this.getElement().find('.eaSortableTable-wUserTable-notification');
        }
    });
});
