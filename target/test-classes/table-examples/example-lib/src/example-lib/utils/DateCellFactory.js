define([
    'tablelib/Cell',
    'i18n/AdvancedDateTime'
], function (Cell, dateTime) {
    'use strict';

    return {
        build: function (options) {
            options = options || {};

            return Cell.extend({
                setValue: function (value) {
                    var formattedDate = dateTime(value).format(options.format || 'D');
                    this.getElement().setText(formattedDate);
                },

                setTooltip: function (value) {
                    this.getElement().setAttribute('title', dateTime(value).format(options.format || 'D'));
                }
            });
        }
    };
});
