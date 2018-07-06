/*global define*/
define([
    'tablelib/Cell',
    './TreeTableCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        View: View,

        ROW_EXPAND: 'tree-table-cell:expand',
        ROW_COLLAPSE: 'tree-table-cell:collapse',

        onCellReady: function () {
            var rowData = this.getRow().getData(),
                iconElt = this.view.getIcon(),
                indent = rowData.indent || 0,
                element = this.getElement(),
                paddingLeft = parseInt(element.getStyle('padding-left')) + (20 * indent) + 'px';

            element.setStyle('padding-left', paddingLeft);

            if (rowData.children) {
                this.updateArrow();

                iconElt.addEventHandler('click', function (e) {
                    e.stopPropagation();

                    rowData.expanded = !rowData.expanded;
                    this.updateArrow();

                    this.getTable().trigger(rowData.expanded ? 'tree-table-cell:expand' : 'tree-table-cell:collapse', {
                        index: this.getRow().getIndex(),
                        data: rowData
                    });
                }.bind(this));
            }
            else {
                iconElt.setModifier('noChild');
            }
        },

        setValue: function (value) {
            this.view.getContent().setText(value);
        },

        updateArrow: function () {
            var rowData = this.getRow().getData(),
                icon = this.view.getIcon(),
                oldIcon = rowData.expanded ? 'rightArrow' : 'downArrow',
                newIcon = rowData.expanded ? 'downArrow' : 'rightArrow';

            icon.removeModifier(oldIcon, 'ebIcon');
            icon.setModifier(newIcon, '', 'ebIcon');
        }
    });
});
