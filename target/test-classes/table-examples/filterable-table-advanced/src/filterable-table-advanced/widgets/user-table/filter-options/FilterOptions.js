/*global define*/
define([
    'widgets/ItemsControl',
    './FilterOptionsView',
    'i18n!filterable-table-advanced/dictionary.json'
], function (ItemsControl, View, dictionary) {
    'use strict';

    return ItemsControl.extend({

        View: View,

        onControlReady: function () {
            this.setOption('width', 'auto');

            this.setItems(getItemsByType(this.options.type));

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

    function getItemsByType(type) {
        switch (type) {
            case 'boolean':
                return [
                    {name: '=', title: dictionary.get('comparator.equal')},
                    {name: '!=', title: dictionary.get('comparator.notEqual')}
                ];
            case 'date':
                return [
                    {name: '=', title: dictionary.get('comparator.equal')},
                    {name: '>', title: dictionary.get('comparator.higher')},
                    {name: '<', title: dictionary.get('comparator.lower')}
                ];
            case 'string':
                return [
                    {name: '=', title: dictionary.get('comparator.equal')},
                    {name: 'abc*', title: dictionary.get('comparator.startsWith')},
                    {name: '*abc', title: dictionary.get('comparator.endsWith')},
                    {name: '*abc*', title: dictionary.get('comparator.contains')}
                ];
            // number
            default :
                return [
                    {name: '=', title: dictionary.get('comparator.equal')},
                    {name: '!=', title: dictionary.get('comparator.notEqual')},
                    {name: '>', title: dictionary.get('comparator.higher')},
                    {name: '<', title: dictionary.get('comparator.lower')}
                ];
        }
    }
});
