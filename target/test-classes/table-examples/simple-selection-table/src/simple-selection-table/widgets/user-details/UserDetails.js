/*global define*/
define([
    'jscore/core',
    './UserDetailsView',
    'i18n!simple-selection-table/dictionary.json'
], function (core, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                user: this.options,
                firstName: dictionary.get('user.firstName'),
                lastName: dictionary.get('user.lastName'),
                role: dictionary.get('user.role')
            });
        }
    });
});
