define([
    'jscore/core',
    'template!./_detailsTabRegion.html',
    'styles!./_detailsTabRegion.less'
], function(core, template, styles) {
    'use strict';

    return core.View.extend({

        showModifier: 'show',

        getTemplate: function() {
            return template(this.options);
        },

        getStyle: function() {
            return styles;
        },

        getJobSummaryDetailsContent: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-OverviewContent');
        },

        getJobSummaryFileName: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-FileName');
        },

        getJobSummaryLastValidation: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-LastValidation');
        },

        getJobSummaryLastExecution: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-LastExecution');
        },

        getJobSummaryValidationPolicy: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-ValidationPolicy');
        },

        getJobSummaryExecutionPolicy: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-ExecutionPolicy');
        },

        getJobSummaryCreationDate: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-CreationDate');
        },
        getJobSummaryCreatedBy: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-CreatedBy');
        },

    });
});
