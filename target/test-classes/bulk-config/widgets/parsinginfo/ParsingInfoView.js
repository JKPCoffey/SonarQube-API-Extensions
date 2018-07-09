define([
    'jscore/core',
    'template!./_parsingInfo.html',
    'styles!./_parsingInfo.less'
], function (core, template, style) {

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },

        getStyle: function() {
            return style;
        }

    });
});
