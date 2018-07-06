define([
    'jscore/core',
    'text!./_fdnCell.html',
    'styles!./_fdnCell.less'
], function (core, template, style) {
    return core.View.extend({
        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return style;
        },

        getFdnTextHolder: function () {
            return this.getElement().find(".elBulkImportLib-FdnText");
        }
    });
});