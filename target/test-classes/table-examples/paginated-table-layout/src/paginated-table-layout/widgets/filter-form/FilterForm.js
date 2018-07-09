/*global define*/
define([
    'jscore/core',
    'uit!./_filterForm.hbs',
    'i18n!paginated-table-layout/dictionary.json'
], function (core, View, dictionary) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            var data = this.options.data || {};

            return new View({
                i18n: {
                    username: {
                        label: dictionary.get('filterForm.username.label'),
                        info: dictionary.get('filterForm.username.info'),
                        placeholder: dictionary.get('filterForm.username.placeholder')
                    },
                    status: {
                        label: dictionary.get('filterForm.status.label'),
                        info: dictionary.get('filterForm.status.info'),
                        items: {
                            all: dictionary.get('filterForm.status.items[0].name'),
                            activated: dictionary.get('filterForm.status.items[1].name'),
                            deactivated: dictionary.get('filterForm.status.items[2].name')
                        }
                    },
                    firstName: {
                        label: dictionary.get('filterForm.firstName.label'),
                        info: dictionary.get('filterForm.firstName.info'),
                        placeholder: dictionary.get('filterForm.firstName.placeholder')
                    },
                    lastName: {
                        label: dictionary.get('filterForm.lastName.label'),
                        info: dictionary.get('filterForm.lastName.info'),
                        placeholder: dictionary.get('filterForm.lastName.placeholder')
                    },
                    role: {
                        label: dictionary.get('filterForm.role.label'),
                        info: dictionary.get('filterForm.role.info'),
                        placeholder: dictionary.get('filterForm.role.placeholder')
                    },
                    email: {
                        label: dictionary.get('filterForm.email.label'),
                        info: dictionary.get('filterForm.email.info'),
                        placeholder: dictionary.get('filterForm.email.placeholder')
                    }
                },
                data: {
                    username: data.username,
                    status: {
                        all: data.status === undefined || data.status === 'all',
                        activated: data.status === 'true',
                        deactivated: data.status === 'false'
                    },
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role,
                    email: data.email
                }
            });
        },

        onViewReady: function(){
            //Adding eventHandler for keydown to check for Enter key.
            //This is for the story CDS-6438
            this.getElement().addEventHandler('keydown', function (e) {
                //Checking for both Return key and Numeric Keypad 'Enter'
                if (e.originalEvent.code === 'Enter' || e.originalEvent.which === 13) {
                    this.trigger('filter:apply');
                }
            }.bind(this));
        },

        onDestroy: function () {
            this.view.findById('form').destroy();
        },

        reset: function () {
            var form = this.view.findById('form');
            form.setData({
                username: '',
                status: 'all',
                firstName: '',
                lastName: '',
                role: '',
                email: ''
            });
        },

        toJSON: function () {
            var data = this.view.findById('form').getData(),
                filterAttr = {};

            Object.keys(data)
                .forEach(function (key) {
                    // all selected is like having no filter
                    if (key === 'status' && data[key] === 'all') {
                        return;
                    }

                    if (data[key]) {
                        // non empty filter input
                        filterAttr[key] = data[key];
                    }
                });

            // the layout detects empty objects and sets the filters to undefined
            return filterAttr;
        }

    });
});
