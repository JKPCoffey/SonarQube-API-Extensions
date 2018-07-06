define([
    'jscore/core',
    'template!./_jobProgress.html',
    'styles!./_jobProgress.less'
], function(core, template, styles) {
    return core.View.extend({
        getTemplate: function() {
            return template({
                header: this.options.header,
                value: Math.round(this.options.value*100)
            });
        },

        getStyle: function() {
            return styles;
        },

        getProgress: function() {
            return this.getElement().find('.elBulkImportLib-wJobProgress-bar-line');
        },

        setProgress: function(progress) {
            progress = (progress > 1) ? 1 : progress;
            this.getProgress().setStyle('width', progress * 100 + '%');
        }
    });
});
