define([
    'jscore/core',
    'networkexplorerlib/regions/collectionscommon/CollectionsCommon',
    'networkexplorerlib/rest/classes/FavouriteManagementApi',
    'i18n!networkexplorerlib/collectionselector.json'
], function( core, CollectionsCommon, FavouriteManagementApi, strings ) {

    /**
     * Shared Region
     *
     * Options:
     *   enableFullView: {Boolean} if false just the “name” column will be visible. If true or not specified all columns
     *                             will be visible.
     *                             In any case the visibility of each column can be overridden by enabling/disabling it
     *                             with tableColumns option.
     *   enableMultipleSelection: {Boolean} if true multiple rows selection will be enabled. If false or not specified
     *                            single row selection will be enabled.
     *   onlyShowEditable: {Boolean} true enables the display of resources that can be updated (Default is false)
     *   tableColumns: {Object} description of columns visualization (optional). It allows to specify if a given column
     *                          will be visible or hidden, regardless of the enableFullView option value.
     *   {
     *      owner|sharing|date|favourites: {
     *          visible: {Boolean} false columns is hidden (default is true if enableFullView isn't setted false).
     *      }
     *   }
     *
     * @class CollectionSelector
     */
    return CollectionsCommon.extend({

        resourceURL: '/object-configuration/v1/collections',
        regionName: 'CollectionSelector',

        /*
         * Object lifecycle method
         */
        init: function() {
            if( this.options.enableFullView === false ) {
                this.options.tableColumns = {
                    owner: {
                        visible: false
                    },
                    sharing: {
                        visible: false
                    },
                    date: {
                        visible: false
                    },
                    favourites: {
                        visible: false
                    }
                };
            }

            this.options.tableColumnsModifiers = {
                date: {
                    title: strings.get('table.modified')
                }
            };

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
            return 'CollectionSelector:'+eventName;
        },

        /**
         * It filters depending on user permissions
         *
         * @method applyPermissionFilters
         * @param {object} collections to be filtered
         * @return {object} filtered collections
         */
        applyPermissionFilters: function (collections) {
            if (this.options.onlyShowEditable) {
                return collections.filter(function(collection) {
                    return !collection.readOnly;
                });
            }
            return collections;
        },

        /**
         * It converts the response data from REST to table format.
         *
         * @method convertRestDataToTableData
         * @param {object} data from rest response
         * @return {object} list of table compliant struct data
         */
        convertRestDataToTableData: function( formatRest ) {
            var formatTable = [];
            var collections = [];

            if (formatRest.length) {
                for (var i = 0; i < formatRest.length; i++) {
                    collections = collections.concat(formatRest[i].collections);
                }
            } else {
                collections = formatRest.collections;
            }

            for (var entry = 0; entry < collections.length; entry++) {
                formatTable.push({
                    id: collections[entry].id,
                    name: collections[entry].name,
                    sharing: collections[entry].category,
                    owner: collections[entry].userId,
                    favourites: this.getFavouriteManagementApi().isFavourite(collections[entry].id),
                    readOnly: collections[entry].readOnly,
                    date: this.convertTimestampToViewInTable(collections[entry].lastUpdated)
                });
            }

            return formatTable;
        }
    });
});
