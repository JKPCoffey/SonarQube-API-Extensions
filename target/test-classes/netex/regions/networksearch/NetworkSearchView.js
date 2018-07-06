define([
    'jscore/core',
    'text!./NetworkSearch.html',
    'styles!./NetworkSearch.less'
], function (core, template, styles) {

    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        },

        getContentPlaceholder: function () {
            return this.getElement().find('.elNetworkExplorerLib-NetworkSearch-ContentContainer');
        }

    });

});
