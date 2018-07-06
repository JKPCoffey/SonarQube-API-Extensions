define([
    'jscore/core',
    'example-lib/utils/AppLayout',
    './widgets/application-list/ApplicationList'
], function (core, appLayout, ApplicationList) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            appLayout.initializeTopSection.call(this, {
                content: new ApplicationList({
                    namespace: this.options.namespace,
                    apps: this.options.properties.children
                })
            });
        }
    });
});
