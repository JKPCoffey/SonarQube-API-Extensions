define([
    'jscore/core',
    'template!./_fileErrors.html',
    'styles!./_fileErrors.less'
], function (core, template, style) {

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function() {
            return style;
        },

        getContainer: function() {
            return this.getElement().find('.elBulkImportLib-wFileErrors-contentHolder');
        }
    });
});
