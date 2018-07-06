define([
    'jscore/core',
    'template!./collectionCreatorFromFile.html',
    'styles!./collectionCreatorFromFile.less',
    'i18n!networkexplorerlib/fileuploader.json'
], function(core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function() {
            return styles;
        },

        getInsertCollection: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionCreatorFromFile-insertCollection');
        },

        getFileUploader: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionCreatorFromFile-fileUploader');
        },

        getSubmitButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionCreatorFromFile-actionButtons-buttonsBlock-submitButton');
        },

        getCancelButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionCreatorFromFile-actionButtons-buttonsBlock-cancelButton');
        },

        getInlineError: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionCreatorFromFile-inlineError');
        },

    });
});