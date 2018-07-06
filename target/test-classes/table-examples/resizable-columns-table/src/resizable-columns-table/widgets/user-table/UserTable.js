/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/StickyScrollbar',
    'tablelib/plugins/SmartTooltips',
    'example-lib/utils/MockData',
    './UserTableView',
    'i18n!resizable-columns-table/dictionary.json'
], function (core, Table, ResizableHeader, StickyScrollbar, SmartTooltips,
             mockData, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var i = 1,
                colLabel = dictionary.get('table.column') + ' ',
                columns = [
                    {
                        title: colLabel + i++,
                        attribute: 'column_1',
                        resizable: true,
                        width: '200px',
                        smartTooltipMode: {header: SmartTooltips.TOOLTIP_MODE.ALWAYS, rows: SmartTooltips.TOOLTIP_MODE.ALWAYS},
                        tooltip: dictionary.get('table.header1')
                    },
                    {title: colLabel + i++, attribute: 'column_2', resizable: true, width: '150px', minWidth: 100},
                    {
                        title: colLabel + i++,
                        attribute: 'column_3',
                        resizable: true,
                        width: '200px',
                        smartTooltipMode: {header: SmartTooltips.TOOLTIP_MODE.NEVER, rows: SmartTooltips.TOOLTIP_MODE.NEVER}
                    },
                    {title: colLabel + i++, attribute: 'column_4', resizable: true},
                    {title: colLabel + i, attribute: 'column_5', resizable: true}
                ],
                table = new Table({
                    data: buildMockData(),
                    columns: columns,
                    plugins: [
                        new ResizableHeader(),
                        new StickyScrollbar(),
                        new SmartTooltips()
                    ],
                    modifiers: [
                        {name: 'striped'} // Applying a different table style
                    ]
                });

            table.attachTo(this.getElement());
        }
    });

    function buildMockData() {
        var data = mockData.generate({
            rows: 25,
            attributes: {
                column_1: 'default',
                column_2: 'default',
                column_3: 'default',
                column_4: 'lorem',
                column_5: 'lorem'
            }
        });

        data.forEach(function (d) {
            d.column_1 += ', tooltip always on';
            d.column_3 += ', tooltip always off';
        });

        return data;
    }

});
