define([
    'jscore/core',
    'jscore/ext/mvp',
    'jscore/ext/net',
    './ArrayUtils',
    './ErrorHandler',
    'networkexplorerlib/ManagedObjectsApi',
    'networkexplorerlib/ObjectConfigurationApi',
    'i18n!networkexplorerlib/Results.json'
], function (core, mvp, net, Arrays, ErrorHandler, ManagedObjectsApi, ObjectConfigurationApi, strings) { // NOSONAR

    /**
     * ResultsData
     * -----------
     * Store data about the results of:
     * * Search queries
     * * Collection requests
     * * Saved Search requests
     *
     * Publish events that declare any errors arising from these requests
     *
     * @class ResultsData
     * @param options
     * @constructor
     */
    var ResultsData = function (options) {
        this.options = options;
        this._eventBus = new core.EventBus();

        this.xhr = undefined;
        this.searchTerm = undefined;
        this.currentSearchOrPoId = undefined; // Used to check if a new results set needs to be loaded
        this.loadSortedData = undefined;
        this.holdCurrentSearchOrPoId = undefined;
        this.currentType = undefined;
        this.saveSearchEnabled = false;
        this.resultsRetryTimeout = undefined;
        this.retryCount = 0;
        this.collectionInContext = undefined;
        this.errorHandler = new ErrorHandler();
        this.lastLoadedSearchQuery = undefined;
        this.cache = options.cache;
        this.customHeaders = {
            "X-Netex-Scoping-Panel": options.isScopingPanel
        };
        this.managedObjectsAPI = new ManagedObjectsApi();
    };

    ResultsData.prototype = {

        RETRY_INTERVALS: [2000, 5000, 10000],

        SAVED_SEARCH_DATA: 'savedSearchData',
        SAVED_SEARCH_INFO: 'savedSearchInfo',
        COLLECTION: 'collection',
        SEARCH: 'search',

        COLLECTION_NOT_FOUND_ERROR_CODE: 10007,
        SAVED_SEARCH_NOT_FOUND_ERROR_CODE: 10008,
        RECOGNIZED_SERVICE_ERROR_CODES: {
            TOPOLOGY_SEARCH: [
                1001, - 1, 10002, 10003, 10004, 10005, 10006, 10007, 10009, 10010, 10011, 10012, 10013, 10014, 10015,
                10016, 10017, 10018, 10019, 10020, 10021, 10024, 10025, 10026
            ],
            TOPOLOGY_COLLECTIONS: [
                1001, - 1, 10007, 10008, 10009, 10010, 10011, 10012, 10013, 10014, 10017, 10018, 10019, 10020, 10021,
                10022, 10023, 10024, 10025, 10026, 10027, 10028, 10029, 10030, 10031
            ],
            CM_COMMON: [
                1004, 1005, 1006, 1007, 1009, 1010, 1012, 1013, 1014, 1019, 1020, 1022, 1023, 1025, 1026, 1028, 1029,
                1030, 1031, 1032, 1033, 1034, 1040, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 2003, 3001, 5009, 6013,
                9031, 9032, 9033
            ]
        },

        trigger: function () {
            this._eventBus.publish.apply(this._eventBus, arguments);
        },

        addEventHandler: function () {
            this._eventBus.subscribe.apply(this._eventBus, arguments);
        },

        /**
         * Generic fetch function for results
         *
         * Uses:
         * - this.resultsType
         * - this.xhr
         *
         * @param fetchOptions {Object} type:string, url:string, success:function, error:function
         */
        executeFetch: function (fetchOptions) {
            this.executeFetchActionBeforeRequest();

            this.xhr = net.ajax({
                type: 'GET',
                dataType: 'json',
                url: fetchOptions.url,
                headers: this.customHeaders,
                success: function (data) {
                    fetchOptions.onIdListFetched(data, fetchOptions.success);
                }.bind(this),
                error: fetchOptions.error.bind(this)
            });
        },

        /**
         * Call method and send event before rest request.
         *
         * Uses:
         * - this.cache
         */
        executeFetchActionBeforeRequest: function () {
            this.abortFetch();
            this.cache.clear();
            this.trigger('resultsdata:fetchStarted');
        },

        /**
         * Callback for ajax request for poIds. Will trigger events for warnings.
         *
         * Uses:
         * - this.currentSearchData
         *
         * @param {Object} searchData The initial request's response. Always includes attributes,
         *              attributeMappings, objects and metadata.
         * @param {Function} callback Method to be executed when the page data is fetched
         */
        onIdListFetchedForSearch: function (searchData, callback) {
            this.currentSearchData = this.managedObjectsAPI.getCurrentSearchData(searchData);
            this.postIdListFetch(searchData, callback);
        },

        onIdListFetchedForCollectionsV2: function (searchData, callback) {
            this.currentSearchData = Object.assign({}, searchData); // Shallow copy
            this.currentSearchData.attributes = ['neType'];
            this.currentSearchData.attributeMappings = [{
                'moType': 'MeContext',
                'attributeNames': ['neType']
            }, {
                'moType': 'ManagedElement',
                'attributeNames': ['neType']
            }, {
                'moType': 'NetworkElement',
                'attributeNames': ['neType']
            }];
            // Provide empty objects array if the payload did not provide it
            this.currentSearchData.objects = (searchData.objects || []).filter(function(element) {
                return (element.name!=="[Deleted]");
            });
            this.postIdListFetch(searchData, callback);
        },

        /**
         * Populate the cache with initial search objects with id and type
         * @param searchData initial search data
         * @param callback Function to call on completion
         */
        postIdListFetch: function (searchData, callback) {
            this.cache.add(this.currentSearchData.objects);
            if (searchData.metadata &&
                searchData.metadata.RESULT_SET_TOTAL_SIZE &&
                searchData.metadata.MAX_UI_CACHE_SIZE &&
                searchData.metadata.RESULT_SET_TOTAL_SIZE > searchData.metadata.MAX_UI_CACHE_SIZE) {
                this.trigger('resultsdata:resultsSizeWarning');
            } else {
                this.trigger('resultsdata:resultsSizeOk');
            }
            callback(this.currentSearchData);
        },

        /**
         * Cancels XHRs
         *
         * Uses:
         * - this.xhr
         */
        abortFetch: function () {
            if (this.xhr) {
                this.lastAbortedXhrReadyState = this.xhr.getReadyState();
                if(this.isFetchPending()) {
                    this.xhr.abort();
                    this.xhr = undefined;
                    this.resetSearchParameters();
                }
            }
            this.trigger('resultsdata:abortFetch');
        },

        /**
         * Determines if the last aborted xhr is still in progress
         *
         * @returns {Boolean} true if fetch is still pending
         */
        isFetchPending: function () {
            return this.lastAbortedXhrReadyState ? this.lastAbortedXhrReadyState !== 4: false;
        },

        /**
         * General fetch (GET) onError callback
         *
         * Uses:
         * - ResultsStrings
         *
         * @param collection
         * @param xhr
         * @param retryParams
         */
        fetchError: function (collection, xhr, retryParams) {
            if (xhr.getStatusText() === 'abort') {
                // if the request was aborted by the user, a different request will follow. Take no further action
                this.resetSearchParameters();
                return;
            }

            var errorBody = {}, responseContainsJson = true;
            try {
                errorBody = JSON.parse(xhr.getResponseText()); // Throws an Error when raw html is found
            } catch (e) {
                responseContainsJson = false;
            }

            if (responseContainsJson) {
                this.fetchErrorFromService(errorBody, xhr, retryParams);
            }

            if (!responseContainsJson) {
                // Apache throws this when services are going down or coming up.
                if (xhr.getStatus() === 404) {
                    errorBody = this.getErrorBody(
                        strings.get('serverUnavailableErrorHeader'),
                        strings.get('serverUnavailableErrorParagraph'),
                        true,
                        false);
                    this.retryFetch(errorBody);
                    return;
                }
                // Catch all 503, 504 etc from apache
                errorBody = this.errorHandler.getErrorContext(xhr);
                this.trigger('resultsdata:fetchError', errorBody);
                this.resetSearchParameters();
                return;
            }
        },

        /**
         * Handles error from service when response contains JSON.
         * @param errorBody error object parsed from JSON
         * @param xhr
         * @param retryParams
         */
        fetchErrorFromService: function(errorBody, xhr, retryParams) {                // Protect against deprecated REST endpoint being present (< 17.9)
            if (this.managedObjectsAPI.isFdnEndpointResponse(errorBody)){
                if(this.managedObjectsAPI.isFallbackAvailable()) {
                    this.managedObjectsAPI.fallback();
                    this.retryFetch(errorBody, retryParams);
                } else {
                    this.trigger('resultsdata:fetchError', errorBody);
                    this.resetSearchParameters();
                }
                return;
            }

            // if the Saved Search was deleted/invalid then do not retry
            if (errorBody.internalErrorCode === this.SAVED_SEARCH_NOT_FOUND_ERROR_CODE) {
                this.triggerDisplayNotFoundErrorFor('savedSearch');
                this.resetSearchParameters();
                return;
            }
            // if the Collection was deleted/invalid then do not retry
            if (errorBody.internalErrorCode === this.COLLECTION_NOT_FOUND_ERROR_CODE) {
                this.triggerDisplayNotFoundErrorFor('collection');
                this.resetSearchParameters();
                return;
            }

            if(xhr.getStatus() !== 404) {
                // if error code is recognized from TCS or TSS then display error immediately
                var allRecognizedErrorCodes = this.RECOGNIZED_SERVICE_ERROR_CODES.TOPOLOGY_SEARCH
                    .concat(this.RECOGNIZED_SERVICE_ERROR_CODES.TOPOLOGY_COLLECTIONS)
                    .concat(this.RECOGNIZED_SERVICE_ERROR_CODES.CM_COMMON);
                if(allRecognizedErrorCodes.indexOf(errorBody.errorCode) >= 0) {
                    this.trigger('resultsdata:fetchError', errorBody);
                    this.resetSearchParameters();
                    return;
                }
                // otherwise force skip to older endpoint if available
                if(this.managedObjectsAPI.isFallbackAvailable()) {
                    this.managedObjectsAPI.fallback();
                    this.resetRetryCounter(); // reset as version is skipped
                } else {
                    // if no older endpoint then display error
                    this.trigger('resultsdata:fetchError', errorBody);
                    this.resetSearchParameters();
                    return;
                }
            }

            // 404 + json response = potential intermittent issue, retry
            this.retryFetch(errorBody, retryParams);
        },

        /**
         * Displays custom error message for a collection or saved search that is not found.
         * @param type savedSearch or collection
         */
        triggerDisplayNotFoundErrorFor: function (type) {
            var errorBody = this.createErrorMessageResponseFor(type);
            this.trigger('resultsdata:collectionFetchError', errorBody);
        },

        /**
         * Resets API version and retry counter.
         */
        resetSearchParameters: function () {
            this.managedObjectsAPI.reset();
            this.resetRetryCounter();
        },

        /**
         * Creates a Error Message Response for a 'savedSearch' or 'collection' when they are
         * not found by the service.
         *
         * @param {String} savedSearchOrCollection 'savedSearch' or 'collection'
         * @return{Object} Error Message Response
         */
        createErrorMessageResponseFor: function (savedSearchOrCollection) {
            return this.getErrorBody(
                strings.get('headerItemNotFound')
                    .replace('$1', strings.get(savedSearchOrCollection)),
                strings.get('messageItemNotFound')
                    .replace('$1', strings.get(savedSearchOrCollection)),
                false,
                true);
        },

        /**
         * Create and return error body message for collections and saved searches.
         *
         * @param title Title to display in the error widget
         * @param body Content to display in the error widget
         * @param isOffline Set true if the error is a result of network disconnection
         * @param objectNotFound Set true if the error is a result of a service driven 404
         */
        getErrorBody: function (title, body, isOffline, objectNotFound) {
            return {
                userMessage: {
                    title: title,
                    body: body
                },
                isOffline: isOffline || false,
                objectNotFound: objectNotFound || false
            };
        },

        /**
         * Generic error callback for collections and saved searches
         *
         * @param collection
         * @param xhr
         */
        fetchSavedSearchCollectionsError: function (collection, xhr) {
            this.fetchError(collection, xhr);
        },

        /**
         * Checks if the search context has been changed
         *
         * Uses:
         * - this.resultsColWidths
         * - ResultsStrings
         *
         * @param {String} searchTermOrPoId
         *
         * @return{Boolean} haveSearchParamsChanged
         */
        haveSearchParamsChanged: function (searchTermOrPoId, forceUpdate) {
            this.holdCurrentSearchOrPoId = searchTermOrPoId;
            // Trim all the whitespace in the searchTermOrPoId
            var newSearchTermOrPoId = searchTermOrPoId.trim().replace(/\s+/gi, ' ');
            // If this is a new search query
            if (newSearchTermOrPoId !== this.currentSearchOrPoId || this.retryCount > 0 || forceUpdate) {
                if (newSearchTermOrPoId !== this.currentSearchOrPoId) {
                    this.resetRetryCounter();
                }
                // Use new search term to fetch
                this.currentSearchOrPoId = newSearchTermOrPoId;
                return true;
            } else {
                return false;
            }
        },

        /**
         * Reset Collection Context
         *
         * @method resetCollectionInContext
         */
        resetCollectionInContext: function() {
            this.collectionInContext = undefined;
        },

        /**
         * Reset the last loaded SearchQuery
         *
         * @method resetLastLoadedSearchQuery
         */
        resetLastLoadedSearchQuery: function() {
            this.lastLoadedSearchQuery = undefined;
        },

        /**
         * Returns true if user have admin rights to remove objects from collection, false otherwise
         *
         * @method isUserHavingRemovableRights
         * @return {Boolean} true if user is having admin rights for removing objects from collection
         */
        isUserHavingRemovableRights: function () {
            return (this.collectionInContext && !this.collectionInContext.readOnly);
        },

        /**
         * Executed when searchHash event is triggered. Calls executeFetch with options specific to search.
         *
         * Uses:
         * - this.sortColumn
         * - this.resultsRetryTimeout
         * - this.currentType
         * - this.saveSearchEnabled
         * - this.searchTerm
         *
         * @param searchTerm
         * @param sortColumn
         */
        loadSearch: function (searchTerm, sortColumn, sortDirection, forceUpdate) {
            this.sortColumn = sortColumn;
            this.sortDirection = sortDirection;
            clearTimeout(this.resultsRetryTimeout);
            this.currentType = this.SEARCH;
            this.saveSearchEnabled = false;
            this.resetCollectionInContext();
            if (this.haveSearchParamsChanged(searchTerm, forceUpdate)) {
                this.searchTerm = searchTerm;
                var doExecuteFetch = function (restEndpoint) {
                    this.executeFetch({
                        type: this.SEARCH,
                        url: restEndpoint,
                        error: function (collection, xhr) {
                            if (this.retryCount < this.RETRY_INTERVALS.length) {
                                this.fetchError(collection, xhr);
                            } else if (this.managedObjectsAPI.isFallbackAvailable()) {
                                this.managedObjectsAPI.fallback();
                                this.resetRetryCounter();
                                doExecuteFetch(this.managedObjectsAPI.getSearchQueryUri(this.searchTerm, this.sortColumn, this.sortDirection));
                            } else {
                                this.fetchError(collection, xhr);
                                this.managedObjectsAPI.reset();
                            }
                        }.bind(this),
                        onIdListFetched: this.onIdListFetchedForSearch.bind(this),
                        success: function() {
                            this.loadSearchSuccess();
                            this.managedObjectsAPI.reset();
                        }.bind(this)
                    });
                }.bind(this);
                doExecuteFetch(this.managedObjectsAPI.getSearchQueryUri(searchTerm, this.sortColumn, this.sortDirection));
            }
        },

        /**
         * Sets loadSortedData to loadSearch, resets the retry counter, and triggers a searchLoaded event
         *
         * Uses:
         * - this.loadSortedData
         * - this.unsavedSearch
         * - this.searchRetried
         */
        loadSearchSuccess: function () {
            // This is used by the sortTable method so it doesn't need to know about what the current results set is from
            this.loadSortedData = this.loadSearch;
            this.saveSearchEnabled = true;
            this.resetRetryCounter();
            this.trigger('resultsdata:searchLoaded');
        },

        /**
         * Executed when NetworkExplorer:collectionHash event is triggered. Calls executeFetch with options specific to collections.
         *
         * Uses:
         * - this.sortColumn
         * - this.saveSearchEnabled
         * - this.resultsRetryTimeout
         * - this.currentType
         * - this.loadCollectionFetchData
         *
         * @param poId
         * @param sortColumn
         */
        loadCollection: function (poId, sortColumn, sortDirection, forceUpdate) {
            clearTimeout(this.resultsRetryTimeout);
            this.sortColumn = sortColumn;
            this.sortDirection = sortDirection;
            this.saveSearchEnabled = false;
            this.currentType = this.COLLECTION;
            if (this.haveSearchParamsChanged(poId, forceUpdate)) {
                this.searchTerm = poId;
                this.executeFetchActionBeforeRequest();

                ObjectConfigurationApi.loadCollection({
                    params: {
                        query: {
                            includeMappings: true,
                            orderBy: (this.sortColumn ? this.sortColumn : 'moName'),
                            orderDirection: (this.sortDirection ? this.sortDirection : 'asc')
                        },
                        request: {
                            id: poId
                        }
                    },
                    dataType: 'json',
                    success: function (data) {
                        this.onIdListFetchedForCollectionsV2(data, this.loadCollectionSuccess.bind(this));
                    }.bind(this),
                    error: this.fetchSavedSearchCollectionsError.bind(this)
                });

            }
        },

        /**
         * Sets loadSortedData to loadSearch, resets the retry counter, and triggers a searchLoaded event
         *
         * Uses:
         * - this.loadSortedData
         * - this.currentSearchData
         * - this.collectionRetried
         */
        loadCollectionSuccess: function () {
            // This is used by the sortTable method so it doesn't need to know about what the current results set is from
            this.loadSortedData = this.loadCollection;
            this.collectionInContext = {
                readOnly: this.currentSearchData.readOnly
            };
            this.resetRetryCounter();
            this.trigger('resultsdata:collectionLoaded');
        },

        /**
         * Does an AJAX request to get the information of the saved search
         *
         * Uses:
         * - this.sortColumn
         * - this.saveSearchEnabled
         * - this.resultsRetryTimeout
         * - this.currentType
         *
         * @param poId
         * @param sortColumn
         */
        loadSavedSearchInfo: function (poId, sortColumn, sortDirection, forceUpdate) {
            this.sortColumn = sortColumn;
            this.sortDirection = sortDirection;
            this.saveSearchEnabled = false;
            clearTimeout(this.resultsRetryTimeout);
            this.currentType = this.SAVED_SEARCH_INFO;
            this.resetCollectionInContext();
            if (this.haveSearchParamsChanged(poId, forceUpdate)) {
                this.searchTerm = poId;
                this.trigger('resultsdata:fetchStarted');
                this.xhr = net.ajax({
                    type: 'GET',
                    url: '/topologyCollections/savedSearches/' + poId,
                    dataType: 'json',
                    success: this.loadSavedSearchData.bind(this),
                    error: function (message) {
                        this.fetchSavedSearchCollectionsError(message, this.xhr);
                    }.bind(this)
                });
            }
        },

        /**
         * Calls executeFetch with options specific to saved search data.
         *
         * Uses:
         * - this.sortColumn
         * - this.currentType
         *
         * @param savedSearchInfo
         */
        loadSavedSearchData: function (savedSearchInfo) {
            this.currentType = this.SAVED_SEARCH_DATA;

            this.lastLoadedSearchQuery = savedSearchInfo.searchQuery;

            this.resetCollectionInContext();

            // Added this type of control to manage nested savedSearch. In this case the URL is overridden with the last query loaded.
            if (this.lastLoadedSearchQuery !== undefined) {
                this.lastLoadedSearchQuery = savedSearchInfo.searchQuery;
                this.searchTerm = this.lastLoadedSearchQuery;
            }

            var doExecuteFetch = function (restEndpoint) {
                this.executeFetch({
                    type: this.SEARCH,
                    url: restEndpoint,
                    error: function (collection, xhr) {
                        if(this.retryCount < this.RETRY_INTERVALS.length) {
                            this.fetchError(collection, xhr, [savedSearchInfo]);
                        } else if (this.managedObjectsAPI.isFallbackAvailable()) {
                            this.managedObjectsAPI.fallback();
                            this.resetRetryCounter();
                            doExecuteFetch(this.managedObjectsAPI.getSearchQueryUri(encodeURIComponent(savedSearchInfo.searchQuery), this.sortColumn, this.sortDirection));
                        } else {
                            this.trigger('resultsdata:setSearchField', savedSearchInfo.searchQuery);
                            this.fetchError(collection, xhr, [savedSearchInfo]);
                            this.trigger('resultsdata:showInfo', {
                                type: 'savedSearch',
                                name: savedSearchInfo.name,
                                size: 0,
                                poId: savedSearchInfo.poId
                            });
                            this.managedObjectsAPI.reset();
                        }
                    }.bind(this),
                    onIdListFetched: this.onIdListFetchedForSearch.bind(this),
                    success: function () {
                        this.loadSavedSearchDataSuccess(savedSearchInfo);
                        this.managedObjectsAPI.reset();
                    }.bind(this)
                });
            }.bind(this);
            doExecuteFetch(this.managedObjectsAPI.getSearchQueryUri(encodeURIComponent(savedSearchInfo.searchQuery), this.sortColumn, this.sortDirection));
        },

        /**
         * Sets loadSortedData to loadSavedSearch, resets the retry counter, and triggers a savedSearchLoaded event
         * with the saved search info
         *
         * Uses:
         * - this.saveSearchEnabled
         * - this.loadSortedData
         *
         * @param savedSearchInfo
         */
        loadSavedSearchDataSuccess: function (savedSearchInfo) {
            this.saveSearchEnabled = true;
            // This is used by the sortTable method so it doesn't need to know about what the current results set is from
            this.loadSortedData = this.loadSavedSearchInfo;
            this.resetRetryCounter();
            this.trigger('resultsdata:savedSearchLoaded', savedSearchInfo);
        },

        /**
         * Retry fetch action.
         * Shows a warning to the user then repeats the GET request.
         *
         * Uses:
         * - this.currentType
         * - this.searchRetried
         * - this.savedSearchDataRetried
         *
         * @param errorBody
         * @param retryParams
         */
        retryFetch: function (errorBody, retryParams) {
            if (this.retryCount === 0) {
                this.trigger('resultsdata:retrying');
            }
            switch (this.currentType) {
                case this.SAVED_SEARCH_INFO:
                    this.retrySavedSearch(errorBody);
                    break;
                case this.SAVED_SEARCH_DATA:
                    this.retrySavedSearchData.apply(this, [errorBody].concat(retryParams));
                    break;
                case this.COLLECTION:
                    this.retryCollection(errorBody);
                    break;
                default:
                    this.retrySearch(errorBody);
                    break;
            }
        },

        retryError: function (errorBody) {
            this.resetRetryCounter();
            this.trigger('resultsdata:fetchError', errorBody);
            if (errorBody.isOffline) {
                this.trigger('resultsdata:servicesAreOffline');
            }
        },

        /**
         * Retry "Search" action
         *
         * Uses:
         * - this.searchRetried
         * - this.resultsRetryTimeout
         * - this.searchTerm
         * - this.sortColumn
         */
        retrySearch: function(errorBody) {
            if (this.RETRY_INTERVALS[this.retryCount]) {
                this.resultsRetryTimeout = setTimeout(function () {
                    this.loadSearch(this.searchTerm, this.sortColumn);
                }.bind(this), this.RETRY_INTERVALS[this.retryCount]);
                this.retryCount++;
            } else {
                this.retryError(errorBody);
            }
        },

        /**
         * Sets retry timeout for collections
         *
         * Uses:
         * - this.collectionRetried
         * - this.resultsRetryTimeout
         * - this.holdCurrentSearchOrPoId
         * - this.sortColumn
         *
         * @param errorBody
         */
        retryCollection: function(errorBody) {
            if (this.RETRY_INTERVALS[this.retryCount]) {
                this.resultsRetryTimeout = setTimeout(function () {
                    this.loadCollection(this.holdCurrentSearchOrPoId, this.sortColumn);
                }.bind(this), this.RETRY_INTERVALS[this.retryCount]);
                this.retryCount++;
            } else {
                this.retryError(errorBody);
            }
        },

        /**
         * Sets retry timeout for saved searches
         *
         * Uses:
         * - this.savedSearchRetried
         * - this.resultsRetryTimeout
         * - this.holdCurrentSearchOrPoId
         * - this.sortColumn
         *
         * @param errorBody
         */
        retrySavedSearch: function(errorBody) {
            if (this.RETRY_INTERVALS[this.retryCount]) {
                this.resultsRetryTimeout = setTimeout(function () {
                    this.loadSavedSearchInfo(this.holdCurrentSearchOrPoId, this.sortColumn);
                }.bind(this), this.RETRY_INTERVALS[this.retryCount]);
                this.retryCount++;
            } else {
                this.retryError(errorBody);
            }
        },

        /**
         * Sets retry timeout for saved searches
         *
         * Uses:
         * - this.savedSearchDataRetried
         * - this.resultsRetryTimeout
         *
         * @param errorBody
         * @param savedSearchInfo
         */
        retrySavedSearchData: function (errorBody, savedSearchInfo) {
            if (this.RETRY_INTERVALS[this.retryCount]) {
                this.resultsRetryTimeout = setTimeout(function () {
                    this.loadSavedSearchData(savedSearchInfo);
                }.bind(this), this.RETRY_INTERVALS[this.retryCount]);
                this.retryCount++;
            } else {
                this.retryError(errorBody);
            }
        },

        /**
         * Reset all retry counters
         */
        resetRetryCounter: function () {
            if (this.retryCount > 0) {
                this.trigger('resultsdata:retryingComplete');
                this.retryCount = 0;
            }
        },

        /**
         * Callback for NetworkExplorer:appLoaded. Resets currentSearchOrPoId to force a refresh
         *
         * Uses:
         * - this.currentSearchOrPoId
         */
        resetCurrentSearchOrPoId: function () {
            this.currentSearchOrPoId = undefined;
        },

        getSearchTerm: function () {
            // this.searchTerm search term is used in fetch, therefore is
            // encoded (decode before presenting to UI)!
            return decodeURIComponent(this.searchTerm);
        },

        getCurrentSearchData: function () {
            return this.currentSearchData;
        },

        getCurrentSearchOrPoId: function () {
            return this.currentSearchOrPoId;
        },

        getSortColumn: function () {
            return this.sortColumn;
        },

        isSavedSearchEnabled: function () {
            return this.saveSearchEnabled;
        },

        resetSavedSearchEnabled: function () {
            this.saveSearchEnabled = false;
        }

    };

    return ResultsData;

});
