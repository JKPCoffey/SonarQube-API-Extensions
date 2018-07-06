define([
    'jscore/core',
    'container/api',
    'example-lib/utils/AppLayout',
    './widgets/user-table/UserTable',
    'i18n!paginated-table-layout/dictionary.json'
], function (core, containerApi, appLayout, UserTable, dictionary) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            var userTable = new UserTable();

            appLayout.initializeTopSection.call(this, {
                content: userTable
            });
            userTable.addEventHandler('user:selected', this.onUserSelect.bind(this));
            this.userTable = userTable;
        },

        onUserSelect: function (users) {
            var eventBus = this.getEventBus();
            if (users.length === 0) {
                eventBus.publish('topsection:leavecontext');
            } else {
                var actions = [{
                    name: dictionary.get('actions.deleteSelection'),
                    type: 'button',
                    icon: 'delete',
                    action: this.userTable.deleteUsers.bind(this.userTable, users)
                }];
                eventBus.publish('topsection:contextactions', actions);
            }
        }
    });
});
