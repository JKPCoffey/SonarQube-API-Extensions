define([
    './loaderoverlay/LoaderOverlay',
    'jscore/core'
], function (LoaderOverlay, core) {

    var loaderOverlay = new LoaderOverlay();
    var isShowing = false;

    return core.Widget.extend({

        /*
            Custom loader Widget with label
         */

        show: function(element) {
            if (!isShowing) {
                isShowing = true;
                loaderOverlay.attachTo(element);
                // Skip frame so that the background transition animates
                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        loaderOverlay.getElement().setModifier('show');
                    });
                });
            }
        },

        setLabel: function (message) {
            loaderOverlay.setMessage(message);
        },

        hide: function() {
            if (isShowing) {
                isShowing = false;
                loaderOverlay.detach();
                loaderOverlay.getElement().removeModifier('show');
            }
        }
    });

});
