define([
    'jscore/core',
    'template!./_jobFilters.html',
    'styles!./_jobFilters.less',
    'i18n!bulkimportlib/dictionary.json'
], function(core, template, styles, dictionary) {
    return core.View.extend({
        getTemplate: function() {
            return template({dictionary: dictionary});
        },

        getStyle: function() {
            return styles;
        },

        getApply: function() {
            return this.getElement().find('.elBulkImportLib-wJobFilters-Side-controls-apply');
        },

        getCancel: function() {
            return this.getElement().find('.elBulkImportLib-wJobFilters-Side-controls-cancel');
        },

        getDateTimeRangeFilterHolder: function() {
            return this.getElement().find('.elBulkImportLib-wJobFilters-dateTimeRange');
        }
    });
});
