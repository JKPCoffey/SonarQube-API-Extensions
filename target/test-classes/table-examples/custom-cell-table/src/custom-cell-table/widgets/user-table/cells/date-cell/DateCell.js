/*global define*/
define([
    'tablelib/Cell',
    'i18n/AdvancedDateTime'
], function (Cell, dateTime) {
    'use strict';

    return Cell.extend({

        setValue: function (value) {
            this.getElement().setText(dateTime(value).format('D'));
        },

        setTooltip: function (value) {
            this.getElement().setAttribute('title', dateTime(value).format('D'));
        }

    });

});
