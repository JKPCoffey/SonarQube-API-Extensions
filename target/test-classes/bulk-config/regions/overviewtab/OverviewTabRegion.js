define([
    'jscore/core',
    './OverviewTabRegionView',
    'i18n!bulkimportlib/dictionary.json'
], function (core, View, i18n) {
    'use strict';

    return core.Region.extend({
        jobSummary: null,

        view: function () {
            return new View({i18n: i18n});
        },

        updateTabView: function (job) {
            if (job) {
                this.setFieldColour(this.view.getJobSummaryFileErrors(), job.failures);
                this.setFieldColour(this.view.getJobSummaryExecutedErrors(), job.executionErrors);
                this.setFieldColour(this.view.getJobSummaryValidationErrors(), job.invalid);

                this.view.getJobSummaryFileErrors().setText(job.failures);
                this.view.getJobSummaryTotalOperations().setText(job.parsed);
                this.view.getJobSummaryValidOperations().setText(job.valid);
                this.view.getJobSummaryValidationErrors().setText(job.invalid);
                this.view.getJobSummaryTotalExecuted().setText(job.succesExecuted);
                this.view.getJobSummaryExecutedErrors().setText(job.executionErrors);
                this.view.setJobSummaryLink('#bulkconfiguration/jobdetails?jobId=' + job.id);
                this.view.getJobSummaryOverviewContent().removeModifier('hide');
            }
        },

        setFieldColour: function (element, errorCount) {
            if (errorCount) {
                element.getNative().style.color = "red";
            } else {
                element.getNative().style.color = "initial";
            }
        },
    });
});
