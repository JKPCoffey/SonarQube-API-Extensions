/*global define*/
define([
    'jscore/core',
    'template!./_tableSettingsForm.hbs',
    'styles!./_tableSettingsForm.less'
], function (core, template, styles) {
    'use strict';

    var __prefix = '.eaPinnedColumnTable-wTableSettingsForm';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function () {
            return styles;
        },

        getContent: function () {
            return this.getElement().find(__prefix + '-content');
        },

        getApply: function () {
            return this.getElement().find(__prefix + '-apply');
        },

        getCancel: function () {
            return this.getElement().find(__prefix + '-cancel');
        }
    });
});
