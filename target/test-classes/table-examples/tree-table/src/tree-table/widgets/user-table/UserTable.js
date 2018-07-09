/*global define*/
define([
    'jscore/core',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'example-lib/utils/MockData',
    './cells/tree-table-cell/TreeTableCell',
    './UserTableView',
    'i18n!tree-table/dictionary.json'
], function (core, Table, ResizableHeader, mockData, TreeTableCell, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var table = new Table({
                data: buildMockData(),
                columns: [
                    // @formatter:off
                    {title: dictionary.get('table.title'),       attribute: 'title',       width: '200px', resizable: true, cellType: TreeTableCell},
                    {title: dictionary.get('table.firstName'),   attribute: 'firstName',   width: '200px', resizable: true},
                    {title: dictionary.get('table.lastName'),    attribute: 'lastName',    width: '200px', resizable: true},
                    {title: dictionary.get('table.description'), attribute: 'description', resizable: true}
                    // @formatter:on
                ],
                plugins: [
                    new ResizableHeader()
                ],
                modifiers: [
                    {name: 'striped'} // Applying a different table style
                ]
            });

            table.addEventHandler('tree-table-cell:expand', this.onRowExpand.bind(this));
            table.addEventHandler('tree-table-cell:collapse', this.onRowCollapse.bind(this));

            table.attachTo(this.getElement());
            this.table = table;
        },

        onRowExpand: function (row) {
            if (row.data.children) {
                expandChildren.call(this, row.data, row.index);
            }
        },

        onRowCollapse: function (row) {
            recursiveCollapseChildren.call(this, row.data, row.index);
        }
    });

    function expandChildren(data, index) {
        /* jshint validthis:true */

        function recursiveExpandChildren(data) {
            data.children.forEach(function (child) {

                this.table.addRow(child, ++index);

                if (child.children && child.expanded) {
                    recursiveExpandChildren.call(this, child);
                }
            }.bind(this));
        }

        recursiveExpandChildren.call(this, data);
    }

    function recursiveCollapseChildren(data, index) {
        /* jshint validthis:true */

        data.children.forEach(function (child) {
            this.table.removeRow(index + 1);

            if (child.children && child.expanded) {
                recursiveCollapseChildren.call(this, child, index);
            }
        }.bind(this));
    }

    function buildMockData() {
        function buildItemMockData(prefix, indent) {
            var mockOptions = {
                rows: 5,
                attributes: {
                    title: 'default',
                    firstName: 'default',
                    lastName: 'default',
                    description: 'lorem'
                }
            };

            mockOptions.prefix = prefix;

            var data = mockData.generate(mockOptions);

            data.forEach(function (item) {
                item.indent = indent;
                return item;
            });

            return data;
        }

        var data = buildItemMockData('Parent', 0);

        data[0].children = buildItemMockData('Child of 0', 1);
        data[1].children = buildItemMockData('Child of 1', 1);
        data[2].children = buildItemMockData('Child of 2', 1);

        data[0].children[0].children = buildItemMockData('Child of 0', 2);
        data[0].children[1].children = buildItemMockData('Child of 1', 2);

        data[1].children[1].children = buildItemMockData('Child of 1', 2);
        data[1].children[3].children = buildItemMockData('Child of 3', 2);

        return data;
    }
});
