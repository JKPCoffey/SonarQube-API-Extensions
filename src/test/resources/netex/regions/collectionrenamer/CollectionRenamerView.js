define([
    'jscore/core',
    'template!./collectionRenamer.html',
    'styles!./collectionRenamer.less',
    'i18n!networkexplorerlib/collectionrenamer.json'
], function(core, template, styles, strings) {

    var ERROR = "error";

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function() {
            return styles;
        },

        getInlineError: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionRenamer-inlineError');
        },

        getCollectionNameInput: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionRenamer-collectionNameInput');
        },

        getCollectionNameValue: function() {
            return this.getCollectionNameInput().getProperty('value').trim();
        },

        isCollectionNameValid: function() {

            // to show the 'required' error when user empty the field
            // after the initial visualization
            this.getCollectionNameInput().setAttribute("required");

            return this.getCollectionNameInput().getNative().checkValidity();
        },

        getInputStatusError: function() {
            return this.getElement().find('.ebInput-statusError');
        },

        setInputStatusErrorText: function(text) {
            return this.getInputStatusError().setText(text);
        },

        getSubmitButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionRenamer-actionButtons-buttonsBlock-submitButton');
        },

        getCancelButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionRenamer-actionButtons-buttonsBlock-cancelButton');
        }
    });
});