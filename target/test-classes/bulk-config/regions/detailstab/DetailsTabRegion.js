define([
    'jscore/core',
    './DetailsTabRegionView',
    'i18n!bulkimportlib/dictionary.json'
], function(core, View, i18n) {
    'use strict';

    return core.Region.extend({
        jobSummary: null,
        view: function() {
            return new View({i18n: i18n});
        },

        onViewReady: function() {

        },

        updateTabView: function(job) {
            if (job) {
                this.view.getJobSummaryFileName().setText(job.fileName);
                this.view.getJobSummaryLastValidation().setText(job.validationFinished);
                this.view.getJobSummaryLastExecution().setText(job.executionFinished);

                this.displayCorrectValidationPolicy(job.validationPolicy);
                this.displayCorrectErrorPolicy(job.executionPolicy);

                this.view.getJobSummaryCreationDate().setText(job.created);
                this.view.getJobSummaryCreatedBy().setText(job.userId);
            }
        },

        displayCorrectValidationPolicy: function(jobValidationPolicy){
            switch (jobValidationPolicy[0]) {
                case 'instance-validation':
                    this.view.getJobSummaryValidationPolicy().setText('Instance Validation - Included');
                    break;
                case 'no-instance-validation':
                    this.view.getJobSummaryValidationPolicy().setText('Instance Validation - Skipped');
                    break;
                default:
                    this.view.getJobSummaryValidationPolicy().setText(jobValidationPolicy[0]);
            }
        },

        displayCorrectErrorPolicy: function(jobExecutionPolicy) {
            switch (jobExecutionPolicy[0]) {
                case 'stop-on-error':
                    this.view.getJobSummaryExecutionPolicy().setText('Stop');
                    break;
                case 'continue-on-error-node':
                    this.view.getJobSummaryExecutionPolicy().setText('Skip to next node');
                    break;
                case 'continue-on-error-operation':
                    this.view.getJobSummaryExecutionPolicy().setText('Skip to next operation');
                    break;
                default:
                    this.view.getJobSummaryExecutionPolicy().setText(jobExecutionPolicy[0]);
            }
        }
    });
});
