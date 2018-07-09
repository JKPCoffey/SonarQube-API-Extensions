/*global define*/
define([
    'jscore/core',
    'widgets/InlineMessage',
    '../user-details/UserDetails',
    'i18n!simple-selection-table/dictionary.json'
], function (core, InlineMessage, UserDetails, dictionary) {
    'use strict';

    return core.Widget.extend({

        onViewReady: function () {
            this.setContent();
        },

        setContent: function (content) {
            if (this.content !== undefined) {
                this.content.destroy();
            }

            var displayedContent = content !== undefined ? new UserDetails(content) : new InlineMessage({
                header: dictionary.get('details.noSelection.header'),
                description: dictionary.get('details.noSelection.message')
            });

            displayedContent.attachTo(this.getElement());
            this.content = displayedContent;
        }
    });
});
