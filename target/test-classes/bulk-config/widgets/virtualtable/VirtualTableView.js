define([
    'jscore/core',
    'text!./_virtualTable.html',
    'styles!./_virtualTable.less'
], function(core, template, styles) {
    return core.View.extend({
        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        }
    });
});
