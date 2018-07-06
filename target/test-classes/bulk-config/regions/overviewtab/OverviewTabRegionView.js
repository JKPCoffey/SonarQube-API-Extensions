define([
    'jscore/core',
    'template!./_overviewTabRegion.html',
    'styles!./_overviewTabRegion.less'
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

        getJobSummaryOverviewContent: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-OverviewContent');
        },

        getJobSummaryFileErrors: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-FilerErrors');
        },

        getJobSummaryTotalOperations: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-TotalOperations');
        },

        getJobSummaryValidOperations: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-ValidOperations');
        },

        getJobSummaryValidationErrors: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-ValidationErrors');
        },

        getJobSummaryTotalExecuted: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-Executed');
        },

        getJobSummaryExecutedErrors: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-ExecutedErrors');
        },

        getJobSummaryLinkWrapper: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-JobSummaryLinkWrapper');
        },

        getJobSummaryLink: function() {
            return this.getElement().find('.elBulkImportLib-JobSummary-JobSummaryLink');
        },

        setJobSummaryLink: function(href) {
            this.getJobSummaryLink().setAttribute('href', href);
        }
    });
});
