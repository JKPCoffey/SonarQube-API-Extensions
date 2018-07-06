/*global define*/
define([
    'jscore/core',
    'i18n/AdvancedDateTime',
    './CustomRowContentView'
], function (core, dateTime, View) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            var options = this.options,
                rowData = options.row.getData(),
                data = [];

            options.keyToLabel.forEach(function (keyLabelMap) {
                var colData = rowData[keyLabelMap.key];

                if (colData instanceof Date) {
                    colData = dateTime(colData).format('D');
                }

                data.push({
                    label: keyLabelMap.label,
                    value: colData
                });
            });

            return new View({data: data});
        }
    });
});
