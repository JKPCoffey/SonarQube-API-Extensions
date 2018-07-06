define([
    'jscore/core',
    'widgets/Dialog',
    "i18n!bulkimportlib/dictionary.json"
], function(core, Dialog, dictionary) {
    'use strict';
    return core.Widget.extend({
        init: function(options) {
            this.dialog = new Dialog({
                header: options.header,
                type: 'warning',
                content: options.content,
                buttons: [
                    {
                        caption: options.buttonText,
                        color: 'darkBlue',
                        action: options.action
                    },
                    {
                        caption: dictionary.cancel,
                        action: function() {
                            this.dialog.hide();
                        }.bind(this)
                    }
                ]
            });
        }
    });
});







