define([
    'jscore/core',
    'template!./_dateTimeRange.html',
    'styles!./_dateTimeRange.less',
], function(core, template, styles) {

    return core.View.extend({

        getTemplate: function() {
            return template(this.options);
        },

        getStyle: function() {
            return styles;
        },

        getCreatedFromFilterHolder: function() {
            return this.getElement().find('.elBulkImportLib-wDateTimeRange-createdFrom');
        },

        getCreatedToFilterHolder: function() {
            return this.getElement().find('.elBulkImportLib-wDateTimeRange-createdTo');
        }
    });
});
