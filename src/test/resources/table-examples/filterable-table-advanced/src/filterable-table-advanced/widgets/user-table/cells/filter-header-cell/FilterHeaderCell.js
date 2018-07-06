/*global define*/
define([
    'tablelib/Cell',
    'widgets/PopupDatePicker',
    '../../filter-options/FilterOptions',
    './FilterHeaderCellView',
    'i18n!filterable-table-advanced/dictionary.json'
], function (Cell, PopupDatePicker, FilterOptions, View, dictionary) {
    'use strict';

    return Cell.extend({

        View: View,

        onViewReady: function () {
            // Filter options will provide us the dropdown with our comparator operations
            var attributeType = this.getColumnDefinition().attributeType,
                filterOptions = new FilterOptions({
                    type: attributeType
                });

            filterOptions.attachTo(this.view.getFilterOptionsPlaceHolder());
            filterOptions.addEventHandler('change', this.onFilterOptionChange.bind(this));

            if (attributeType === 'date') {
                this.view.getInputHolder().remove();
                this.setDatePicker();
            }
            else {
                var input = this.view.getInput();

                this.view.getDatePickerHolder().remove();

                input.setAttribute('placeholder', dictionary.get('table.typeToFilter'));
                input.addEventHandler('input', function () {
                    this.onFilterOptionChange();
                }.bind(this));

                positionInput.call(this);

                filterOptions.addEventHandler('change', positionInput.bind(this));
            }

            this.comparator = filterOptions.getValue();
            this.type = attributeType;
        },

        onFilterOptionChange: function (newFilterComparator) {
            var attr = this.getColumnDefinition().attribute,
                type = this.type,
                value = type === 'date' ? this.datePicker.getValue() : this.view.getInput().getValue(),
                comparator = newFilterComparator || this.comparator
            ;

            if (value) {
                if (type === 'date') {
                    value = value.getTime();
                }
                else if (type === 'boolean') {
                    value = value.toLocaleString().toLocaleLowerCase() === 'true';
                }
            }

            if (newFilterComparator !== undefined) {
                this.comparator = newFilterComparator;
            }

            this.getTable().trigger('filter', attr, value, comparator, type);
        },

        setDatePicker: function () {
            var datePicker = new PopupDatePicker();

            datePicker.attachTo(this.view.getDatePickerHolder());
            datePicker.addEventHandler('dateselect', this.onFilterOptionChange.bind(this));
            datePicker.addEventHandler('dateclear', this.onFilterOptionChange.bind(this));

            this.datePicker = datePicker;
        },

        /**
         * MUST BE OVERRIDDEN
         */
        setValue: function () {
            // Prevent the default implementation to override our template
        }
    });

    function positionInput() {
        /* jshint validthis:true */
        requestAnimationFrame(function () {
            var filterOptionWidth = this.view.getFilterOptionsPlaceHolder().getProperty('offsetWidth');
            this.view.getInputHolder().setStyle('left', filterOptionWidth + 'px');
        }.bind(this));
    }
});
