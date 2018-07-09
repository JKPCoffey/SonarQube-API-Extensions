define([
    'jscore/core',
    'text!./_fileErrorsScope.html',
    'styles!./_fileErrorsScope.less'
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
