/*global define*/
define([
    'jscore/core',
    './TableSettingsFormView',
    'i18n!simple-table-settings/dictionary.json'
], function (core, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                apply: dictionary.get('form.apply'),
                cancel: dictionary.get('form.cancel')
            });
        },

        onViewReady: function () {
            this.options.content.attachTo(this.view.getContent());

            this.view.getApply().addEventHandler('click', function () {
                this.trigger('apply');
            }.bind(this));

            this.view.getCancel().addEventHandler('click', function () {
                this.trigger('cancel');
            }.bind(this));
        }
    });
});
