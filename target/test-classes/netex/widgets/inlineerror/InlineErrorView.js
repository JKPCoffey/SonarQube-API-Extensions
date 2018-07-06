define([
    'jscore/core',
    'template!./inlineError.html',
    'styles!./inlineError.less'
], function(core, template, styles) {

    return core.View.extend({

        getTemplate: function() {
            return template();
        },

        getStyle: function() {
            return styles;
        },

        getErrorMessageArea: function() {
            return this.getElement().find('.elNetworkExplorerLib-wInlineError-content');
        },

        getNotificationArea: function() {
            return this.getElement().find('.elNetworkExplorerLib-wInlineError-content-notification-message');
        },

        hideErrorMessage: function() {
            this.getErrorMessageArea().setModifier('hidden');
        },

        showErrorMessage: function() {
            this.getErrorMessageArea().removeModifier('hidden');
        },

        setErrorMessage: function(text) {
            this.getNotificationArea().setText(text);
        }
    });
});