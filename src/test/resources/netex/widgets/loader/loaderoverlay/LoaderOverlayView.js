define([
    'jscore/core',
    'text!./LoaderOverlay.html',
    'styles!./LoaderOverlay.less'
], function (core, template, styles) {
    
    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        },

        getLoaderAnimation: function() {
            return this.getElement().find('.elNetworkExplorerLib-LoaderOverlay-loaderAnimation');
        }

    });

});