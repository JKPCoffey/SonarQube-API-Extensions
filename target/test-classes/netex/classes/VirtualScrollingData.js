define([
    './Cache',
    './RequestQueue',
    './ArrayUtils',
    './AttributeParser'
], function (
     Cache,
     RequestQueue,
     Arrays,
     AttributeParser
) {

    /**
     * VirtualScrollingData
     * --------------------
     * Data model object for the VirtualScrolling and VirtualSelection table plugins
     *
     * @param options
     * @constructor
     */
    var VirtualScrollingData = function (options) {
        // Store params
        this.idAttribute = options.id;
        this.idList = options.list;
        this.errorCallback = options.errorCallback;
        this.attributeMappings = options.attributeMappings || [];
        this.cache = options.cache;

        // Internal objects
        this.requestQueue = new RequestQueue();

        // Requested object tracker
        this.requestMap = {}; // {'id#': true, 'id#': true, etc}

        // Counter
        this.counters = {
            fetchInProgress: 0
        };

        // List Deleted Object
        this.deletedIds = [];
    };

    VirtualScrollingData.prototype = {

        /**
         * Safe batch size for getPosByPoids endpoint
         */
        batchSize: 50,

        /**
         * Callback for VirtualSelection getAllIds
         *
         * @param {Function} success returns ids in order of initial definition
         */
        getAllIds: function(success) {
            success(this.idList.slice());
        },

        /**
         * Callback for VirtualSelection getIds
         *
         * @param {String} lastSelectionId
         * @param {String} firstSelectionId
         * @param {Function} success celled with array of ids in selection order
         */
        getIds: function (lastSelectionId, firstSelectionId, success) {
            var lastIndex = this.idList.indexOf(lastSelectionId);
            var firstIndex = this.idList.indexOf(firstSelectionId);
            var result;
            if(firstIndex < lastIndex) {
                result = this.idList.slice(firstIndex, lastIndex + 1);
            } else {
                result = this.idList.slice(lastIndex, firstIndex + 1);
                result = result.reverse();
            }
            success(result);
        },

        /**
         * Gets the total number of items in the scrollable record set
         *
         * @method getIdCount
         * @return {Number} number of items
         */
        getIdCount: function() {
            return this.idList.length || 0;
        },

        /**
         * Loads data either:
         * * from cache
         * * from endpoint (this must be stored in cache)
         *
         * Does not make a new request for ids that have already been requested - they will either:
         * * resolve successfully
         * * fail, then retry (up to three times), then resolve successfully
         * * fail 4 times, then trigger an error on the entire table
         *
         * @method loadData
         * @param {Number} start index to start from
         * @param {Number} length how many
         * @return {Promise} data: Array of objects, cancelled: true if not all objects were loaded
         */
        loadData: function (start, length) {
            this.deletedIds = [];
            var end = start + length;
            var idList = this.getIdsFromIndexes(start, end);
            if (this.cache.isDataAvailable(idList)) {
                // resolve immediately
                return Promise.resolve({
                    data: this.cache.get(idList)
                });
            }
            //get data from before the requested starting index in the id list
            var fetchStartIndex = Math.max(0, start - length),
                // set the length to include X items more than the requested length
                fetchDataLength = Math.max(50, Math.max(length + 50, Math.min(250, length * 3))),
                // put ceiling on last index of fetch
                lastIndexOfFetch = Math.min(this.idList.length, fetchStartIndex + fetchDataLength);
            var idsToFetch = this.filterAlreadyFetchedIds(
                this.getIdsFromIndexes(fetchStartIndex, lastIndexOfFetch)
            );
            return this.loadDataList(idsToFetch, idList);
        },

        /**
         * Load the data from the datastore.
         *
         * @method loadDataList
         * @param {Array} idsToLoad list of ids to fetch
         * @param {Array} idList (optional) list of ids that are wanted in the response
         * @return {Promise} data: Array of objects, cancelled: true if not all objects were loaded
         */
        loadDataList: function(idsToLoad, idList) {
            return new Promise(function (resolve) {
                if (this.cache.isDataAvailable(idsToLoad)) {
                    // resolve immediately
                    resolve({
                        data: this.cache.get(idsToLoad)
                    });
                } else {
                    var idsToFetch = this.filterAlreadyFetchedIds(idsToLoad);
                    // defer resolution
                    this.fetchDataFromIds(idsToFetch, function () {
                        var idsToReturn = idList || idsToLoad;
                        // If the requests were cancelled, the data will not be fully available
                        var cancelled = !this.cache.isDataAvailable(idsToFetch) && !(this.deletedIds && this.deletedIds.length);
                        resolve({
                            data: this.cache.get(idsToReturn),
                            cancelled: cancelled,
                            deletedIds: this.deletedIds
                        });
                    }.bind(this));
                }
            }.bind(this));
        },

        /**
         * Issues asynchronous requests to retrieve data for a given array of ids
         * Marks indexes as 'fetching' using the requestMap
         *
         * @method fetchDataFromIds
         * @param {Array} idList List of ids
         * @param callback called when all requests are one of succeed/fail/cancel
         */
        fetchDataFromIds: function (idList, callback) {
            // Mark ids as requested so duplicate requests are not made for each id
            idList.forEach(function (id) {
                this.requestMap[id] = true;
            }.bind(this));
            // Divide into batches if necessary
            var idBatches = Arrays.chunk(idList, this.batchSize);
            var requestOptions = idBatches.map(function (idBatch) {
                var requestOption = {
                    type: 'POST',
                    url: '/managedObjects/getPosByPoIds',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        poList: idBatch,
                        defaultMappings: ["syncStatus"],
                        attributeMappings: this.attributeMappings
                    }),
                    success: function (data) {
                        // Fix old endpoint's data
                        data = data.map(function(element) {
                            if (element.poId) {
                                element.id = element.poId;
                            }
                            return element;
                        }).filter(function(element) {
                            if( element.moName === "Deleted" ) {
                                this.deletedIds.push(element.id);
                                return false;
                            }
                            return true;
                        }.bind(this));
                        this.cache.add(AttributeParser.convertComplexAttributes(data));
                        this.counters.fetchInProgress--;
                        // trigger callback only when all pending responses have arrived
                        if (this.counters.fetchInProgress === 0) {
                            callback();
                        }
                    }.bind(this),
                    error: function (msg, xhr) {
                        // retry if possible
                        if (requestOption.retryTimes.length > 0) {
                            var retryTime = requestOption.retryTimes.shift();
                            setTimeout(function () {
                                // add to queue
                                this.requestQueue.add([requestOption]);
                            }.bind(this), retryTime);
                        } else {
                            // notify parent that we cannot continue
                            this.errorCallback(msg, xhr);
                            // else clean up data
                            this.requestQueue.cancelAll();
                            this.counters.fetchInProgress = 0;
                        }
                    }.bind(this),
                    retryTimes: [2000, 5000, 10000]
                };
                return requestOption;
            }.bind(this));
            // add to queue
            this.counters.fetchInProgress += requestOptions.length;
            this.requestQueue.add(requestOptions);
        },

        /**
         * Cancel all fetches in progress.
         *
         * @method cancelFetch
         */
        cancelFetch: function() {
            // Nothing was in the queue, but some requests may be in progress
            // Let them finish
            // Do not trigger a final success callback
            var cancelledRequests = this.requestQueue.cancelAll();
            cancelledRequests.forEach(function(request) {
                // Flag as not fetched
                JSON.parse(request.data).poList.forEach(function(id) {
                    this.requestMap[id] = false;
                }.bind(this));
                // Return empty result for cancelled request
                request.success([]);
            }.bind(this));
        },

        /**
         * Filters out ids that have already been requested
         *
         * @method filterAlreadyFetchedIds
         * @param idList A list of ids which may already be requested
         * @return {Array} A list of ids which are not currently requested
         */
        filterAlreadyFetchedIds: function (idList) {
            return idList.filter(function (id) {
                return !this.requestMap[id];
            }.bind(this));
        },

        /**
         * Retrieves ids given start and end index in table rows
         *
         * @method getIdsFromIndexes
         * @param start starting index
         * @param end finishing index
         * @return {Array} ids between start (inclusive) and finish (exclusive)
         */
        getIdsFromIndexes: function (start, end) {
            return this.idList.slice(start, end);
        },

        /**
         * Cleanup
         */
        destroy: function() {
            this.requestQueue.destroy();
        },

        /**
         * Remove ids from the idList.
         *
         * @method removeIds
         * @param {Array} idsToRemove List of ids
         */
        removeIds: function (idsToRemove) {
            this.idList = Arrays.remove(this.idList, idsToRemove);
        }
    };

    return VirtualScrollingData;
});