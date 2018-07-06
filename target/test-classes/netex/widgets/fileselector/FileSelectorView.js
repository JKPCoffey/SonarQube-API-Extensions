define([
    'jscore/core',
    'template!./fileSelector.html',
    'styles!./fileSelector.less',
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

        getFileName: function() {
            return this.getElement().find('.elNetworkExplorerLib-wFileSelector-textBox-fileName');
        },

        setErrorForFileName: function(){
            this.getFileName().setAttribute("class", "elNetworkExplorerLib-wFileSelector-textBox-fileName elNetworkExplorerLib-wFileSelector-inputError");
        },

        removeErrorForFileName: function(){
            this.getFileName().setAttribute("class", "ebInput elNetworkExplorerLib-wFileSelector-textBox-fileName");
        },

        getFileSelectionInput: function() {
            return this.getElement().find('.elNetworkExplorerLib-wFileSelector-fileSelectorInput');
        },

        getFileNameErrorText: function() {
            return this.getElement().find('.elNetworkExplorerLib-wFileSelector-textBox-fileNameErrorText');
        },

        setFileNameErrorText: function(text) {
            this.getFileNameErrorText().setModifier("error", "true");
            this.getFileNameErrorText().setText(text);
        },

        getFileSelectionButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-wFileSelector-button');
        },

    });
});