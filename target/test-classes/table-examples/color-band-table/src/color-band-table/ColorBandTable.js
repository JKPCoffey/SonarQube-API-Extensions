define([
    'jscore/core',
    'example-lib/utils/AppLayout',
    './widgets/user-table/UserTable'
], function (core, appLayout, UserTable) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            appLayout.initializeTopSection.call(this, {
                content: new UserTable()
            });
        }
    });
});
