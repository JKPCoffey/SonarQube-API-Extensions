define([
    'jscore/core',
    'template!./_AlertCell.hbs',
    'styles!./_AlertCell.less'
], function(core, template, styles) {
    'use strict';

    return core.View.extend({

        getTemplate: function() {
            return template(this.options);
        },

        getStyle: function() {
            return styles;
        },

    });
});
