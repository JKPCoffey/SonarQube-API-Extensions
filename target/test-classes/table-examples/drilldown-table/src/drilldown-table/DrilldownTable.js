define([
    'jscore/core',
    'example-lib/utils/AppLayout',
    './widgets/drill-down/DrillDown'
], function (core, appLayout, DrillDown) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            appLayout.initializeTopSection.call(this, {
                content: new DrillDown()
            });
        }
    });
});
