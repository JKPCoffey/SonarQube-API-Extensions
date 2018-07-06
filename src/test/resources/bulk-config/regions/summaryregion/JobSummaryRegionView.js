define([
    'jscore/core',
    'text!./_jobSummaryRegion.html',
    'styles!./_jobSummaryRegion.less'

], function(core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function() {
            return template;

        },

        getStyle: function() {
            return styles;

        },

        getSelectedHolder: function() {
            return this.getElement().find('.elBulkImportLib-summaryRegion-selectedJobHeader');
        },

        getSelectedNameHolder: function() {
            return this.getElement().find('.elBulkImportLib-summaryRegion-selectedJobHeader-name');
        },

        getSelectedTypeHolder: function() {
            return this.getElement().find('.elBulkImportLib-summaryRegion-selectedJobHeader-attribute');
        },

        getTabs: function() {
            return this.getElement().find('.elBulkImportLib-summaryRegion-tabs');
        },

        getJobSummaryMessageArea: function() {
            return this.getElement().find('.elBulkImportLib-summaryRegion-messageArea');
        }
    });
});
