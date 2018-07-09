define([
    'jscore/core',
    'template!./_tableSetting.html',
    'styles!./_tableSetting.less',
    'i18n!bulkimportlib/dictionary.json'
], function(core, template, styles, dictionary) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                i18n: dictionary
            });
        },

        getStyle: function() {
            return styles;
        },

        getSettings: function() {
            return this.getElement().find('.elBulkImportLib-wTableSetting-Side-content');
        },

        getApply: function() {
            return this.getElement().find('.elBulkImportLib-wTableSetting-Side-controls-apply');
        },

        getCancel: function() {
            return this.getElement().find('.elBulkImportLib-wTableSetting-Side-controls-cancel');
        }
    });
});
