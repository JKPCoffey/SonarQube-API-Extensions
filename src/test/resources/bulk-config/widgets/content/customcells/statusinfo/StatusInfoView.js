define([
    'jscore/core',
    'text!./_statusinfo.html',
    'styles!./_statusinfo.less'
], function (core, template, styles) {
    return core.View.extend({
        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getStatusTextHolder: function () {
            return this.getElement().find(".elBulkImportLib-status-statusInfo-statusText");
        },

        getStatusInfoHolder: function() {
            return this.getElement().find(".elBulkImportLib-status-statusInfo");
        },

        getStatusIconHolder: function() {
            return this.getElement().find(".elBulkImportLib-status-statusInfo-iconHolder");
        },

        setStatusStyleForSuccess: function() {
            this.getStatusInfoHolder().setAttribute("style", "background-color:#777776;border-radius:5px;border-color:#777776");
        },

        setStatusSuccessIcon: function() {
            this.getStatusIconHolder().setAttribute("class", "ebIcon ebIcon_simpleTick_white elBulkImportLib-status-statusInfo-statusInfoIcon");
        },

        setStatusStyleForError: function(styleColor) {
            this.getStatusInfoHolder().setAttribute("style", styleColor);
        },

        setStatusFailedIcon: function() {
            this.getStatusIconHolder().setAttribute("class", "ebIcon ebIcon_close_white elBulkImportLib-status-statusInfo-statusInfoIcon");
        }
    });
});