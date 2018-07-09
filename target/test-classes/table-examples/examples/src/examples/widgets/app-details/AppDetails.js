/*global define*/
define([
    'jscore/core',
    './AppDetailsView'
], function (core, View) {
    'use strict';

    return core.Widget.extend({

        id: 'AppDetails',

        view: function () {
            return new View(this.options);
        }
    });
});
