define([
    'tablelib/Cell',
    './AlertCellView'
], function(Cell, View) {
    'use strict';

    return Cell.extend({
        view: function() {
            return new View();
        },

        setCSS: function(param, value) {
            this.content.setStyle(param, value);
        },

        clearCSS: function() {
            this.content.getNative().style = {};
        },

        setValue: function(value) {
            this.content = this.getElement().find('.elBulkImportLib-wAlertCell-content');
            this.content.setText(value);
            if (value > 0) {
                this.setCSS('color', '#ffffff');
                this.setCSS('border', 'solid 1px #bbbbbb');
                this.setCSS('background-color', this.options.column.bgColor ? this.options.column.bgColor : '#e32119');
            }
            else {
                this.clearCSS();
            }
        }
    });

});
