define([
    'jscore/core',
    './TopologyDropdownView',
    'widgets/ItemsControl',
    'jscore/ext/locationController',
    'i18n!networkexplorerlib/topologydropdown.json'
], function (core, View, ItemsControl, LocationController, strings) {

    /**
     * ## Usage
     *
     * The TopologyDropdown widget allows other applications to easily select topology objects using Network
     * Explorer.
     *
     * Network Explorer will redirect the user back to the specified returnHash, appending URL parameters with the
     * information of the users selection. The following is mapping of dropdown options to the expected URL parameters:

     * | Option                     | Resulting URL parameters                                 |
     * | -------------------------- | -------------------------------------------------------- |
     * | Search for Network Objects | collections=[collection_poids]&generatedCollection=true  |
     * | Add Collections            | collections=[collection_poids]                           |
     * | Add Saved Searches         | savedSearches=[savedSearches_poids]                      |
     *
     * ##### Handling collections:
     * [collection_poids] will be a comma separated list of collection poIds. Collection data can be retrieved using
     * the following REST endpoint, replacing [collection_poid] with a single collection poId:
     * * /topologyCollections/staticCollections/[collection_poid]
     *
     * If you only need the poIds from a collection, you can add ?fullMo=false to the URL:
     * * /topologyCollections/staticCollections/[collection_poid]?fullMo=false
     *
     * If your application requires certain attributes, you can use the following REST endpoint, replacing
     * [collection_poid] with a single collection poId and [attributes] with a comma separated list of attributes
     * required:
     * * /topologyCollections/staticCollections/[collection_poid]/[attributes]
     *
     * If the URL contains the generatedCollection=true URL parameter, your application should delete the collection when it
     * is finished with it. This can be achieved by doing a DELETE request to the following REST endpoint, replacing
     * [collection_poid] with a single collection poId:
     * * /topologyCollections/staticCollections/[collection_poid]
     *
     * ##### Handling saved searches:
     * [savedSearches_poids] will be a comma separated list of saved search poIds. Saved Search information can be
     * retrieved using the following REST endpoint, replacing [savedSearch_poid] with a single saved search poId:
     * * /topologyCollections/savedSearches/[savedSearch_poid]
     *
     * This object will contain the search query. This can then be executed using the following REST endpoint, replacing
     * [searchQuery] with a URL encoded version of the search query obtained from previous REST call.
     * * /managedObjects/query?searchQuery=[searchQuery]
     *
     * ## API
     *
     * ##### Constructor:
     * * ToplologyDropdown(Object options)
     *
     * ##### Events:
     * * itemSelected: an event triggered when an item is selected. Used by applications to identify when that item has been selected.
     *
     * ##### Options:
     * * returnHash: a string defining the hash to redirect to when a user selects topology. This should not include the # symbol. Default is the current hash value at time of click.
     * * type: a string to define the type of dropdown to create
     *     * 'default' - displays a regular dropdown. This is the default value.
     *     * 'fill' - expands the dropdown to fit the width of it's parent
     *     * 'icon' - shows only a topology icon in the dropdown. For use in places where space is limited
     * * searchEnabled: a boolean defining if "Search for Network Objects" options should appear. Default: false
     * * collectionsEnabled: a boolean defining if "Add Collections" options should appear. Default: false
     * * savedSearchesEnabled: a boolean defining if "Add Saved Searches" options should appear. Default: false
     * * singleSelection: a boolean defining if only one item should be selectable. Default: false
     *
     * @class TopologyDropdown
     * @extends ItemsControl
     */
    return ItemsControl.extend({

        View: View,

        /**
         * The init method is automatically called by the constructor when using the "new" operator. If an object with
         * key/value pairs was passed into the constructor then the options variable will have those key/value pairs.
         *
         * @method init
         * @private
         */
        onInit: function () {
            this.options = this.options || {};
            this.options.searchEnabled = this.options.searchEnabled  || false;
            this.options.collectionsEnabled = this.options.collectionsEnabled || false;
            this.options.savedSearchesEnabled = this.options.savedSearchesEnabled || false;
            this.options.singleSelection = this.options.singleSelection || false;
            this.options.type = this.options.type || 'default';
            this.locationController = new LocationController();
            this.options.returnHash = this.options.returnHash || this.locationController.getLocation();
        },

        /**
         * Overrides method from ItemControl.<br>
         * Executes every time, when widget is added back to the screen.
         *
         * @method onControlReady
         * @private
         */
        onControlReady: function () {
            var items = [];
            if (this.options.singleSelection === true) {
                items.push({
                    name: strings.get('searchForNetworkObject'),
                    url: 'networkexplorer?goto=$1&returnType=singleObject'
                });
            } else {
                if (this.options.searchEnabled === true) {
                    items.push({
                        name: strings.get('searchForNetworkObjects'),
                        url: 'networkexplorer?goto=$1&returnType=multipleObjects'
                    });
                }
                if (this.options.collectionsEnabled === true) {
                    items.push({
                        name: strings.get('addCollections'),
                        url: 'networkexplorer/collections?goto=$1&returnType=collections'
                    });
                }
                if (this.options.savedSearchesEnabled === true) {
                    items.push({
                        name: strings.get('addSavedSearches'),
                        url: 'networkexplorer/savedsearches?goto=$1&returnType=savedSearches'
                    });
                }
            }
            this.setItems(items);
            this.view.setCaptionText(strings.get('addTopologyData'));
            this.setType(this.options.type);
        },

        /**
         * A method which is called when an item is selected
         *
         * @method onItemSelected
         * @private
         *
         * @param {Object} selectedItem
         */
        onItemSelected: function (selectedItem) {
            this.trigger("itemSelected");
            this.locationController.setLocation(selectedItem.url.replace('$1', encodeURIComponent(this.options.returnHash)));
        },

        /**
         * Sets the return URL for when an item is selected
         *
         * @method setReturnHash
         * @param {String} returnHash
         */
        setReturnHash: function (returnHash) {
            this.options.returnHash = returnHash;
        },

        /**
         * Changes the type of the dropdown originally set in the constructor.
         *
         * @method setType
         * @param {String} type
         */
        setType: function (type) {
            if (this.options.type) {
                this.view.removeType(this.options.type);
            }
            this.view.setType(type);
            if (type === 'fill') {
                // setWidth is a method on super class, ItemsControl
                this.setWidth('');
            } else {
                // setWidth is a method on super class, ItemsControl
                this.setWidth('180px');
            }
            this.options.type = type;
        }

    });

});
