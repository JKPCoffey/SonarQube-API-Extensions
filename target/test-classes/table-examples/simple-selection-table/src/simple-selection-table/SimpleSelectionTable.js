define([
    'jscore/core',
    'layouts/MultiSlidingPanels',
    'example-lib/utils/AppLayout',
    './widgets/user-table/UserTable',
    './widgets/info-panel/InfoPanel',
    'i18n!simple-selection-table/dictionary.json'
], function (core, MultiSlidingPanels, appLayout, UserTable, InfoPanel, dictionary) {
    'use strict';

    return core.App.extend({

        onStart: function () {
            var userTable = new UserTable(),
                infoPanel = new InfoPanel();

            appLayout.initializeTopSection.call(this, {
                content: new MultiSlidingPanels({
                    context: this.getContext(),
                    resolutionThreshold: 768,
                    rightWidth: 325,
                    main: {label: dictionary.get('user.table'), content: userTable}
                })
            });

            userTable.addEventHandler('user:selected', this.onUserSelect.bind(this));

            this.userTable = userTable;
            this.infoPanel = infoPanel;
        },

        onUserSelect: function (users) {
            var eventBus = this.getEventBus();

            if (users.length === 0) {
                eventBus.publish('topsection:leavecontext');
                delete this.lastSingleSelection;
            }
            else {
                var actions = [{
                    name: dictionary.get('actions.deleteSelection'),
                    type: 'button',
                    icon: 'delete',
                    action: this.userTable.deleteUsers.bind(this.userTable, users)
                }];

                if (users.length === 1) {
                    actions.unshift({
                        name: dictionary.get('actions.viewDetails'),
                        type: 'button',
                        color: 'darkBlue',
                        action: this.onShowDetails.bind(this)
                    });
                }

                eventBus.publish('topsection:contextactions', actions);
            }

            // implement the display for single selection like in Outlook
            if (users.length === 1 || this.lastSingleSelection === undefined && users.length > 1) {
                this.lastSingleSelection = users[0];
            }

            this.infoPanel.setContent(this.lastSingleSelection);
        },

        onShowDetails: function () {
            this.getEventBus().publish('layouts:showpanel', {
                header: dictionary.get('user.details'),
                content: this.infoPanel,
                side: 'right'
            });
        }
    });
});
