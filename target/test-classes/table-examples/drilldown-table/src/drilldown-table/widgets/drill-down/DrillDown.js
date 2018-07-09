/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/RowEvents',
    '../../services/DataService',
    './level-crumbs/LevelCrumbs',
    './DrillDownView',
    'i18n!drilldown-table/dictionary.json'
], function (core, Table, RowEvents, dataService, LevelCrumbs, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                instructions: dictionary.get('instructions')
            });
        },

        onViewReady: function () {
            var data = dataService.getData(5),
                tableLevelCrumb = new LevelCrumbs(),
                table = new Table({
                    data: data,
                    columns: [
                        {title: dictionary.get('table.id'), attribute: 'id', width: '100px'},
                        {title: dictionary.get('table.name'), attribute: 'name'},
                        {title: dictionary.get('table.parent'), attribute: 'parent'},
                        {title: dictionary.get('table.hasChildren'), attribute: 'hasChildren'}
                    ],
                    plugins: [
                        new RowEvents({
                            events: ['click']
                        })
                    ],
                    modifiers: [
                        {name: 'striped'} // Applying a different table style
                    ]
                });

            tableLevelCrumb.addItem({
                name: 'Root',
                action: function () {
                    table.setData(data);
                }
            });

            table.addEventHandler('rowevents:click', this.onRowDblClick.bind(this));

            tableLevelCrumb.attachTo(this.view.getHeader());
            table.attachTo(this.view.getTableHolder());

            this.tableLevelCrumb = tableLevelCrumb;
            this.table = table;
            this.data = data;
        },

        onRowDblClick: function (row) {
            var rowData = row.getData();

            if (rowData.children) {
                this.table.setData(rowData.children);

                this.tableLevelCrumb.addItem({
                    name: 'Level ' + row.getData().name,
                    action: function () {
                        this.table.setData(row.getData().children);
                    }.bind(this)
                });
            }
        }
    });
});
