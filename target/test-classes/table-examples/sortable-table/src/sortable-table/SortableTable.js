define([
    'jscore/core',
    'example-lib/utils/AppLayout',
    './widgets/user-table/UserTable',
    'i18n!sortable-table/dictionary.json'
], function (core, appLayout, UserTable, dictionary) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            createTable.call(this);
            this.userTable.table.setSortIcon('asc', 'continent');

            appLayout.initializeTopSection.call(this, {
                defaultActions: [{
                    name: dictionary.get('actions.multiSort'),
                    type: 'button',
                    action: enableMultiColumnSorting.bind(this)
                }],
                content: this.userTable
            });
        },

        onStop: function () {
            this.layout.destroy();
            this.userTable.destroy();
        }

    });

    function createTable(multiSort) {
        /* jshint validthis:true */
        if (this.userTable !== undefined) {
            this.userTable.destroy();
        }

        this.userTable = new UserTable({
            multiSort: multiSort
        });
    }

    function enableSimpleColumnSorting() {
        /* jshint validthis:true */
        createTable.call(this);
        this.userTable.table.setSortIcon('asc', 'continent');
        this.layout.setContent(this.userTable);

        var actions = [{
            name: dictionary.get('actions.multiSort'),
            type: 'button',
            action: enableMultiColumnSorting.bind(this)
        }];
        this.getEventBus().publish('topsection:defaultactions', actions);
    }

    function enableMultiColumnSorting() {
        /* jshint validthis:true */
        createTable.call(this, true);
        this.layout.setContent(this.userTable);

        this.userTable.table.setMultiSortIcons([{
            mode: 'asc',
            attribute: 'continent'
        }, {
            mode: 'asc',
            attribute: 'country'
        }, {
            mode: 'asc',
            attribute: 'city'
        }]);

        var actions = [{
            name: dictionary.get('actions.simpleSort'),
            type: 'button',
            action: enableSimpleColumnSorting.bind(this)
        }];
        this.getEventBus().publish('topsection:defaultactions', actions);
    }
});
