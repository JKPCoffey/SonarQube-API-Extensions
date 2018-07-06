define([
    'jscore/core',
    'text!./LoaderAnimation.html',
    'styles!./LoaderAnimation.less'
], function (core, template, style) {
    
    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return style;
        }

    });

});