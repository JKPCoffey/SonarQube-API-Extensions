/*global define*/
define([
    'jscore/core',
    '../app-details/AppDetails',
    './ApplicationListView'
], function (core, AppDetails, View) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            this.options.apps.forEach(loadApplicationDetails.bind(this));
        }
    });

    function loadApplicationDetails(packageInfo) {
        /* jshint validthis:true */
        var packageName = packageInfo.app,
            placeHolderElt = new core.Element(),
            onSuccess = function (appData) {
                var appDetails = buildAppDetails(appData, packageName, this.options.namespace);
                appDetails.attachTo(placeHolderElt);
            },
            onError = function (err) {
                placeHolderElt.remove();
                console.error(err);
            };

        placeHolderElt.setAttribute('class', 'eaExamples-wApplicationList-item');
        this.getElement().append(placeHolderElt);

        require({context: packageName}, [
                'i18n!' + packageName + '/app.json'
            ],
            onSuccess.bind(this),
            onError);
    }

    function buildAppDetails(appData, packageName, namespace) {
        var opts = {
            rootPackageName: namespace,
            packageName: packageName
        };

        Object.keys(appData).forEach(function (key) {
            opts[key] = appData[key];
        });

        return new AppDetails(opts);
    }
});
