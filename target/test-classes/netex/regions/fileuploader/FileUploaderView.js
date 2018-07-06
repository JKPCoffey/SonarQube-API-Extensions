define([
    'jscore/core',
    'template!./fileUploader.html',
    'styles!./fileUploader.less',
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

        getFileSelector: function() {
            return this.getElement().find('.elNetworkExplorerLib-rFileUploader-selectionArea-fileSelector');
        }
    });
});