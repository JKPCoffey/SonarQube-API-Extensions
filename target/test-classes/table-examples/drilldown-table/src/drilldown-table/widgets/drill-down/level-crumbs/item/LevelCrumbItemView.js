/*global define*/
define([
    'jscore/core',
    'template!./_levelCrumbItem.hbs'
], function (core, template) {
    'use strict';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        }
    });
});
