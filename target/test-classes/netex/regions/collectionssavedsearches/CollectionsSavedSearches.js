define([
    'jscore/core',
    'networkexplorerlib/regions/collectionscommon/CollectionsCommon',
    'networkexplorerlib/rest/classes/FavouriteManagementApi',
    'i18n!networkexplorerlib/collectionssavedsearches.json',
    'networkexplorerlib/classes/ArrayUtils'
], function( core, CollectionsCommon, FavouriteManagementApi, strings, ArrayUtils ) {

    /**
     * Shared Region
     *
     * Options:
     *   enableMultipleSelection: {Boolean} if true multiple rows selection will be enabled. If false or not specified
     *                            single row selection will be enabled.
     *   tableColumns: {Object} description of columns visualization (optional). It allows to specify if a given column
     *                          will be visible or hidden.
     *   {
     *      owner|sharing|date|favourites: {
     *          visible: {Boolean} false columns is hidden (default is true).
     *      }
     *   }
     *
     * @class CollectionsSavedSearches
     */
    return CollectionsCommon.extend({
        resourceURL: '/topologyCollections/savedSearches',
        regionId: 'CollectionsSavedSearches',

        /*
         * Object lifecycle method
         */
        init: function() {
            CollectionsCommon.prototype.init.call(this);
        },


        /**
         * It returns the class that manages the Favourites REST API.
         *
         * @method getFavouriteManagementApi
         * @return {Object} class ref
         */
        getFavouriteManagementApi: function() {
            return FavouriteManagementApi;
        },


        /**
         * It returns the locale strings for the specific derived classes.
         *
         * @method getStringsImpl
         * @return {Object} map of strings (i18n)
         */
        getStringsImpl: function() {
            return strings;
        },


        /**
         * It create event Id with specific source.
         *
         * @method createEventId
         * @param {String} name of event
         * @return {String} event Id in formati <source>:<event name>
         */
        createEventId: function( eventName ) {
            return 'CollectionsSavedSearches:'+eventName;
        },


        /**
         * It converts the response data from REST to table format.
         *
         * @method convertRestDataToTableData
         * @param {object} data from rest response
         * @return {object} list of table compliant struct data
         */
        convertRestDataToTableData: function(restData) {
            var tableData = ArrayUtils.unchunk(restData).map(function (mapItem) {
                var newItem = {
                    id: mapItem.poId,
                    name: mapItem.name,
                    sharing: (mapItem.attributes) ? mapItem.attributes.category : undefined,
                    owner: (mapItem.attributes) ? mapItem.attributes.userId : undefined,
                    favourites: FavouriteManagementApi.isFavourite(mapItem.poId),
                    deletable: mapItem.deletable,
                    searchQuery: mapItem.searchQuery,
                    date: this.convertTimestampToViewInTable((mapItem.attributes) ? mapItem.attributes.timeCreated : undefined)
                };
                return newItem;
            }.bind(this));

            return tableData;
        },

        /**
         * It allows to extend a base table with additional columns.
         *
         * @method getAdditionalColumns
         * @return {list} list of additional columns descriptors
         */
        getAdditionalColumns: function() {
            return [{
                title: strings.get('table.searchQuery'), attribute: 'searchQuery',  sortable: true, width: '400px' }];
        }
    });
});
