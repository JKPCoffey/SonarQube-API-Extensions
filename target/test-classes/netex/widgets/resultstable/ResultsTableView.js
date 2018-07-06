define([
    'jscore/core',
    'text!./_resultsTable.html',
    'styles!./_resultsTable.less'
], function (core, template, styles) {

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        }

    });

});
