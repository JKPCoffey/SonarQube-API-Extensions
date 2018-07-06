define([
    'jscore/core',
    'template!./_jobCard.html',
    'styles!./_jobCard.less'
], function(core, template, styles) {
    return core.View.extend({
        getTemplate: function() {
            return template(this.options);
        },

        getStyle: function() {
            return styles;
        },

        getContent: function() {
            return this.getElement().find('.elBulkImportLib-wJobCard-content');
        }
    });
});
