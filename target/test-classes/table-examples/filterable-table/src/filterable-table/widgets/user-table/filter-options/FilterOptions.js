/*global define*/
define([
    'widgets/ItemsControl',
    './FilterOptionsView',
    'i18n!filterable-table/dictionary.json'
], function (ItemsControl, View, dictionary) {
    'use strict';

    return ItemsControl.extend({

        View: View,

        onControlReady: function () {
            this.setOption('width', 'auto');

            this.setItems([
                {name: '=', title: dictionary.get('comparator.equal')},
                {name: '!=', title: dictionary.get('comparator.notEqual')},
                {name: '>', title: dictionary.get('comparator.higher')},
                {name: '<', title: dictionary.get('comparator.lower')}
            ]);

            // Set the default option
            this.view.setSelected('=');
        },

        onItemSelected: function (selectedValue) {
            this.view.setSelected(selectedValue.name);
            this.trigger('change', selectedValue.name);
        },

        getValue: function () {
            return this.view.getSelected();
        }
    });
});
