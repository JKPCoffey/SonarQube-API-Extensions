/*global define*/
define([
    'tablelib/Cell',
    './IconCellView'
], function (Cell, View) {
    'use strict';

    return Cell.extend({

        // root element must be a <td>
        view: function () {
            var attr = this.getColumnDefinition().attribute,
                enabled = this.getRow().getData()[attr];

            return new View({
                prefix: 'ebIcon',
                modifier: enabled ? 'simpleGreenTick' : 'error'
            });
        },

        setValue: function () {
        }

    });
});
