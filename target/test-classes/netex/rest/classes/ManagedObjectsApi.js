define(function () {

    /**
     * ManagedObjectsApi
     * -----
     * Contains all versions of Search endpoints
     *
     * @constructor
     */
    var ManagedObjectsAPI = function () {
        this.version = this.LATEST_VERSION;
    };

    ManagedObjectsAPI.prototype = {

        LATEST_VERSION: 2,

        /**
         * Checks if a fallback older REST endpoint is available.
         * @public
         * @return boolean
         */
        isFallbackAvailable: function () {
            var version = this.version;
            return this['generateUriForSearchQueryV' + --version] instanceof Function;
        },

        /**
         * Retrieves the search query URI for the current version.
         * @public
         * @param searchTerm
         * @param sortColumn
         * @param sortDirection
         * @return {String} search query URI
         */
        getSearchQueryUri: function (searchTerm, sortColumn, sortDirection) {
            return this['generateUriForSearchQueryV' + this.version](searchTerm, sortColumn, sortDirection);
        },

        /**
         * Formats the current search data depending on endpoint version.
         * @public
         * @param searchData
         * @return {Object} object containing objects and attributes
         */
        getCurrentSearchData: function (searchData) {
            return this['getCurrentSearchDataV' + this.version](searchData);
        },

        /**
         * Fallback to older endpoint version.
         * @public
         */
        fallback: function () {
            this.version--;
        },

        /**
         * Reset version to the latest version.
         * @public
         */
        reset: function () {
            this.version = this.LATEST_VERSION;
        },

        generateUriForSearchQueryV0: function(query, sortColumn, sortDirection) {
            return '/managedObjects/query?searchQuery='  + query + '&fullMo=false' +
                '&orderby=' + (sortColumn ? sortColumn : 'moName') +
                '&orderdirection=' + (sortDirection ? sortDirection : 'asc');
        },

        generateUriForSearchQueryV1: function(query, sortColumn, sortDirection) {
            return '/managedObjects/search?query='  + query +
                '&orderby=' + (sortColumn ? sortColumn : 'moName') +
                '&orderdirection=' + (sortDirection ? sortDirection : 'asc');
        },

        generateUriForSearchQueryV2: function(query, sortColumn, sortDirection) {
            return '/managedObjects/search/v2?query='  + query +
                '&orderby=' + (sortColumn ? sortColumn : 'moName') +
                '&orderdirection=' + (sortDirection ? sortDirection : 'asc');
        },

        getCurrentSearchDataV0: function (searchData) {
            var currentSearchData = Object.assign({}, searchData); // Shallow copy
            // Transformed to provide id property
            currentSearchData.objects = searchData.poList.map(function (element) {
                return { id : element };
            });
            return currentSearchData;
        },

        getCurrentSearchDataV1: function (searchData) {
            var currentSearchData = Object.assign({}, searchData); // Shallow copy
            // Provide default empty attributes array if the endpoint does not provide one
            currentSearchData.attributes = currentSearchData.attributes || [];
            // Provide empty objects array if the payload did not provide it
            currentSearchData.objects = currentSearchData.objects || [];
            return currentSearchData;
        },

        getCurrentSearchDataV2: function (searchData) {
            return this.getCurrentSearchDataV1(searchData);
        },

        /**
         * Check if the response matches the failure output of /managedObjects/{fdn}
         *
         * @param errorBody
         * @returns {boolean}
         */
        isFdnEndpointResponse: function(errorBody) {
            return errorBody && errorBody.userMessage && errorBody.userMessage.body === 'No Managed Object was found with the given FDN: search';
        }
    };

    return ManagedObjectsAPI;
});