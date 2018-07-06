define([
    'jscore/core',
    'template!./_jobsTable.html',
    'styles!./_jobsTable.less',
    'i18n!bulkimportlib/dictionary.json'
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

        getTableHolder: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-body');
        },

        getActionPanelHolder: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel');
        },

        getErrorMessageArea: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-messageArea');
        },

        getSettingsButton: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-settings');
        },

        getFiltersButton: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-jobFilters');
        },

        getFilterArea: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-filters-jobName');
        },

        getFilterErrorArea: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-errorPanel');
        },

        showFilterInlineError: function() {
            return this.getFilterErrorArea().removeModifier('hidden');
        },

        hideFilterInlineError: function() {
            return this.getFilterErrorArea().setModifier('hidden');
        },

        getMyJobsFilterButton: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-filters-myJobs');
        },

        getValidationErrorsButton: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-filters-validation-errors');
        },

        getExecutionErrorsButton: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-right-filters-execution-errors');
        },

        setTotalRows: function(totalRows) {
            this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-left-totalRows').setText('('+totalRows+')');
        },

        setSelectionCount: function(selectionCount) {
            this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-left-selectedRows').setText(selectionCount);
        },

        getClearFilterLink: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-left-clearFilter-Link');
        },

        getClearFilter: function() {
            return this.getElement().find('.elBulkImportLib-wJobsTable-actionPanel-left-clearFilter');
        },

        showFilterSelection: function() {
            this.getClearFilter().removeStyle('display');
        },

        hideFilterSelection: function() {
            this.getClearFilter().setStyle('display', 'none');
        }
    });
});
