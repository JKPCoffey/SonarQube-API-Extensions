/*global define*/
define([
    'jscore/core',
    './LevelCrumbItemView'
], function (core, View) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View({
                name: this.options.name
            });
        },

        onViewReady: function () {
            this.view.getElement().addEventHandler('click', this.onItemClick.bind(this));
        },

        onItemClick: function () {
            // the action should be executed first as the event is caught by the list to perform list management
            this.executeAction();
            this.trigger('item:click');
        },

        executeAction: function () {
            this.options.action();
        },

        setHidden: function (isHidden) {
            if (isHidden) {
                this.getElement().setStyle("display", "none");
            }
            else {
                this.getElement().removeStyle("display");
            }
        }
    });
});
