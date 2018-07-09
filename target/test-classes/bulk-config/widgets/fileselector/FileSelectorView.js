define([
    'jscore/core',
    'template!./_fileSelector.html',
    'styles!./_fileSelector.less',
    'i18n!bulkimportlib/fileselector.json'
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
            return this.getElement().find('.elBulkImportLib-wFileSelector-textBox-fileName');
        },

        getFileSelectionInput: function() {
            return this.getElement().find('.elBulkImportLib-wFileSelector-fileSelectorInput');
        },

        getFileSelectionButton: function() {
            return this.getElement().find('.elBulkImportLib-wFileSelector-button');
        },

        getFileNameErrorText: function() {
            return this.getElement().find('.elBulkImportLib-wFileSelector-textBox-fileNameErrorText');
        },

        removeFileError: function() {
            this.getFileName().setAttribute(
                'class',
                'ebInput elBulkImportLib-wFileSelector-textBox-fileName'
            );
            this.getFileNameErrorText().setModifier('error', 'false');
            this.getFileNameErrorText().setText('');
        },

        setFileError: function(text) {
            this.getFileName().setAttribute(
                'class',
                'ebInput elBulkImportLib-wFileSelector-textBox-fileName elBulkImportLib-wFileSelector-inputError'
            );
            this.getFileNameErrorText().setModifier('error', 'true');
            this.getFileNameErrorText().setText(text);
        },

    });
});
