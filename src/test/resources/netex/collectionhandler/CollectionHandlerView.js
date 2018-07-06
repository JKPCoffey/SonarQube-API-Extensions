define([
    'jscore/core',
    'template!./collectionHandler.html',
    'styles!./collectionHandler.less',
    'i18n!networkexplorerlib/collectionhandler.json'
], function (core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function () {
            return styles;
        },

        getChooseBlock: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-contentWrapper-chooseBlock');
        },

        getInsertOrSelectBlock: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-contentWrapper-insertOrSelectBlock');
        },

        getAddNoteBlock: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-actionButtons-addNoteBlock');
        },

        showAddNoteBlock: function() {
            this.getAddNoteBlock().removeModifier('hidden');
        },

        hideAddNoteBlock: function() {
            this.getAddNoteBlock().setModifier('hidden');
        },

        getLoaderEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-contentWrapper-loader');
        },

        getSubmitButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-actionButtons-buttonsBlock-submitButton');
        },

        getCancelButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-actionButtons-buttonsBlock-cancelButton');
        },

        getInlineError: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-contentWrapper-inlineError');
        },

        showInlineError: function() {
            this.getInlineError().removeModifier('hidden');
        },

        hideInlineError: function() {
            this.getInlineError().setModifier('hidden');
        },

        getInlineErrorMessage: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionHandler-contentWrapper-inlineErrorMessage');
        },

        setInlineErrorMessage: function(text) {
            this.getInlineErrorMessage().setText(text);
        },

        clearInputText: function(){
            var input = this.getElement().find('.elNetworkExplorerLib-wInsertCollection-collectionNameInput');
            if(input) {
                input.setValue('');
            }
        },

        setTallContent:  function(){
            this.getElement().setModifier('tall');
        },

        unsetTallContent:  function(){
            this.getElement().removeModifier('tall');
        }
    });
});
