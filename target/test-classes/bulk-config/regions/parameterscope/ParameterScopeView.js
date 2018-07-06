define([
    'jscore/core',
    'text!./_parameterScope.html',
    'styles!./_parameterScope.less'
], function(core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        }
    });

});
