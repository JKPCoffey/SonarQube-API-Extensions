define([
    'jscore/core',
    './LoaderOverlayView',
    '../loaderanimation/LoaderAnimation'
], function (core, View, LoaderAnimation) {
    
    return core.Widget.extend({
        View: View,

        onViewReady: function() {
            new LoaderAnimation().attachTo(this.view.getLoaderAnimation());
        },

        setMessage: function(message) {
            this.getElement().find('.elNetworkExplorerLib-LoaderOverlay-message').setText(message);
        }
    });

});