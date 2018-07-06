define([
    'jscore/core',
    './CustomContentView',
    'widgets/Notification',
    'i18n!bulkimportlib/dictionary.json'
], function(core, View, Notification, dictionary) {
    'use strict';
    return core.Widget.extend({
        view: function() {
            var obj = this.options.row.options.model.details;
            return new View({
                actionName: this.options.row.options.model.actionName,
                data: this.options.row.getData().details,
                dictionary: dictionary,
                isExecuted: this.options.row.getData().isExecuted,
                details: Object.keys(obj).length === 0 ? undefined : this.options.row.options.model.details
            });
        },

        onViewReady: function () {
            var setColor = this.options.row.options.model.details.status === 'INVALID' ? 'yellow' : 'red';
            var notification = new Notification({
                label: this.options.row.getData().errorMsg,
                icon: 'error',
                color: setColor,
                autoDismiss: false
            });
            
            notification.attachTo(this.view.getNotificationContent());
        }
    });
});
