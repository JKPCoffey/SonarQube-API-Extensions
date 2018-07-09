define([
    'jscore/core',
    'container/api',
    'example-lib/utils/AppLayout',
    './widgets/user-table/UserTable'
], function (core, containerApi, appLayout, UserTable) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            var userTable = new UserTable();

            userTable.addEventHandler('table-settings:show', function (options) {
                containerApi.getEventBus().publish('flyout:show', options);
            });

            userTable.addEventHandler('table-settings:hide', function () {
                containerApi.getEventBus().publish('flyout:hide');
            });

            appLayout.initializeTopSection.call(this, {
                content: userTable
            });
        }
    });
});
