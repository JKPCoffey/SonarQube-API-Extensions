define([
    'jscore/core',
    'template!./_content.html',
    'styles!./_content.less'
], function (core, template, style) {

    var parentEl = '.elBulkImportLib-wContent-';

    return core.View.extend({

        getTemplate: function () {
            return template();
        },

        getStyle: function() {
            return style;
        },

        getViewElement: function(className) {
            return this.getElement().find(parentEl + className);
        },

        getTableHolder: function() {
           return this.getViewElement("tableHolder");
        }
    });
});