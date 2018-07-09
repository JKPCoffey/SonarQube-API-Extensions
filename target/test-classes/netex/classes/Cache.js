define(function () {
    /**
     * Cache
     * -----
     * Retains a map of object instances
     *
     * Use isDataAvailable to check if there is data in the cache
     * If false, use add() to populate the cache
     * If true, use get() to retrieve the data
     *
     * If the cache is out of date, use clear() to remove all cached data
     *
     * Initialise with the primary key you wish to use for the objects in the cache
     *
     * @constructor
     */
    var Cache = function (idAttribute) {
        this.idAttribute = idAttribute || 'id';
        this.buffer = {};
    };

    Cache.prototype = {
        /**
         * Checks if all of the data is present in the cache
         * Returns false on first miss
         *
         * @method isDataAvailable
         * @param idList Array of ids
         * @return {boolean}
         */
        isDataAvailable: function (idList) {
            for (var index = 0; index < idList.length; index++) {
                if (this.buffer[idList[index]] === undefined || this.buffer[idList[index]].moName === undefined) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Retrieves data from cache
         *
         * @method get
         * @param {Array} idList Array of ids
         * @return {Array} Array of data objects
         */
        get: function (idList) {
            var data = idList.map(function (id) {
                return this.buffer[id];
            }.bind(this));
            return data;
        },

        /**
         * Adds data to cache
         *
         * @method add
         * @param {Array} data Array of objects to add
         */
        add: function (data) {
            for (var index = 0; index < data.length; index++) {
                var object = data[index];
                if (object) {
                    this.buffer[object[this.idAttribute]] = object;
                }
            }
        },

        /**
         * Removes all data from cache
         *
         * @method clear
         */
        clear: function() {
            this.buffer = {};
        }
    };

    return Cache;
});