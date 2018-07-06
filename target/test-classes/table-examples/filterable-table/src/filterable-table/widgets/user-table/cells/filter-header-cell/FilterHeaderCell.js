/*global define*/
define([
    'tablelib/Cell',
    '../../filter-options/FilterOptions',
    './FilterHeaderCellView',
    'i18n!filterable-table/dictionary.json'
], function (Cell, FilterOptions, View, dictionary) {
    'use strict';

    return Cell.extend({

        View: View,

        onViewReady: function () {
            // Filter options will provide us the dropdown with our comparator operations
            var filterOptions = new FilterOptions(),
                input = this.view.getInput();

            filterOptions.attachTo(this.view.getFilterOptionsPlaceHolder());
            filterOptions.addEventHandler('change', this.onFilterOptionChange.bind(this));
            this.comparator = filterOptions.getValue();

            input.setAttribute('placeholder', dictionary.get('table.typeToFilter'));
            input.addEventHandler('input', function () {
                this.onFilterOptionChange.call(this);
            }.bind(this));
        },

        onFilterOptionChange: function (newFilterComparator) {
            var attr = this.getColumnDefinition().attribute,
                value = this.view.getInput().getValue(),
                comparator = newFilterComparator || this.comparator;

            if (newFilterComparator !== undefined) {
                this.comparator = newFilterComparator;
            }

            this.getTable().trigger('filter', attr, value, comparator);
        },

        /**
         * MUST BE OVERRIDDEN
         */
        setValue: function () {
            // We don't want the default implementation to override our template
        }
    });
});
