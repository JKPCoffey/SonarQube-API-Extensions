define([
    'jscore/core',
    'jscore/ext/net',
    './InlineErrorView'
], function(core, net, View) {

    /**
     *
     * @class InLineError
     */
    return core.Widget.extend({

        View: View,

        /**
         * Shows an error message
         *
         * Uses:
         * - this.view
         * - this.errorWidget
         *
         * @method set
         */
        set: function (message) {
            this.view.setErrorMessage(message);
            this.view.showErrorMessage();
        },

        /**
         * Hides the error visualization
         *
         * Uses:
         * - this.view
         * - this.errorWidget
         *
         * @method clear
         */
        clear: function () {
            this.view.hideErrorMessage();
        }
    });
});