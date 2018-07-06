define([
    'jscore/core',
    'template!./collectionUpdaterFromFile.html',
    'styles!./collectionUpdaterFromFile.less',
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

        getFileUploader: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionUpdaterFromFile-fileUploader');
        },

        getReplaceCheckbox: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionUpdaterFromFile-replaceOption-checkbox');
        },

        isReplaceCheckboxSelected: function () {
            return this.getReplaceCheckbox().getProperty('checked');
        },

        getSubmitButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionUpdaterFromFile-actionButtons-buttonsBlock-submitButton');
        },

        getCancelButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionUpdaterFromFile-actionButtons-buttonsBlock-cancelButton');
        },

        getInlineError: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionUpdaterFromFile-inlineError');
        }
    });
});