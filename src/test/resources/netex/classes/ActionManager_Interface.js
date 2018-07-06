define(function () {
    /**
     * ActionManager Interface
     * -----------------------
     * Defines methods to implement an ActionManager
     * Use to work with Actions Framework
     *
     * @constructor
     */
    var ActionManager = function (/*options*/) {
        /* Implement this */
    };

    ActionManager.prototype = {
        /**
         * Get Actions for list of objects
         *
         * @method getActions
         * @param {Array} objects Objects that perform
         * @param callback Receives the array of actions
         */
        getActions: function(/*objects, callback*/) {
            /* Implement this */
        },

        /**
         * Default Actions per context:
         * * Search - Save Search
         * * Saved Search - Save Search
         * * Collection - None
         * * Message - None
         */
        updateDefaultActions: function() {
            /* Implement this */
        },

        /**
         * Reset the visible actions
         */
        reset: function() {
            /* Implement this */
        }

    };

    return ActionManager;
});