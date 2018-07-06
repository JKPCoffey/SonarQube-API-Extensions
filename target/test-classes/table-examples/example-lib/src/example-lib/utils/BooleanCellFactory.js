define([
    'tablelib/Cell'
], function (Cell) {
    'use strict';

    return {
        build: function (options) {
            options = options || {};

            return Cell.extend({
                setValue: function (value) {
                    this.getElement().setText(value ? options.true: options.false);
                },

                setTooltip: function (value) {
                    this.getElement().setAttribute('title', value ? options.true: options.false);
                }
            });
        }
    };
});
