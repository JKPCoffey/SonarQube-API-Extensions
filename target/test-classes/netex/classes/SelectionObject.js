define([
    './ArrayUtils'
], function (
    Arrays
) {
    /**
     * A class for managing user selection of objects from a paged table or other fixed size data structure.
     * SelectionObject caches objects as they are selected by the user. Use setSelectionState or selectAllObjects
     * to set objects as being selected. Use getAllSelectedObjects or getSelectedObjectsFromPage to return the selected
     * objects as an array.
     *
     * @class SelectionObject
     * @constructor
     */
    var SelectionObject = function (options) {
        this.id = options.id || 'id';
        this.insertedIds = [];
        this.data = [];
    };

    SelectionObject.prototype = {
        /**
         * Gets the total count of selected objects
         *
         * @method getCount
         * @return {Number} Number of selection objects
         */
        getCount: function () {
            return this.insertedIds.length;
        },

        /**
         * Returns an array of ids
         *
         * @method getIds
         * @return{Array} Selected ids
         */
        getIds: function () {
            return this.insertedIds;
        },

        /**
         * Remove ids from the idList.
         *
         * @method removeIdsFromList
         * @param {Array} idsToRemove List of ids
         */
        removeIdsFromList: function (idsToRemove) {
            var selectionIds = Arrays.remove(this.getIds(), idsToRemove);
            this.clear();
            this.addIds(selectionIds);
        },

        /**
         * Returns an array of objects
         *
         * @method getObjects
         * @return{Array} Selected objects
         */
        getObjects: function () {
            return this.data;
        },

        /**
         * WARNING
         * -------
         * Redefines entire selection object with new set of objects
         *
         * @method setObjects
         * @param objects
         */
        setObjects: function (objects) {
            this.insertedIds = [];
            this.data = [];
            for(var i=0; i<objects.length; i++) {
                this.data[i] = objects[i];
                this.insertedIds[i] = objects[i][this.id];
            }
        },

        /**
         * Clears the selections
         *
         * @method clear
         */
        clear: function () {
            this.insertedIds = [];
            this.data = [];
        },

        /**
         * Check if current selection contains object with given id.
         *
         * @method contains
         * @param id to search for
         * @return {boolean} true if present
         */
        contains: function(id) {
            return this.insertedIds.indexOf(id) > -1;
        },

        /**
         * Selects ids in given order
         *
         * If no param is used:
         * * selects all ids
         * * discards all known objects from selection
         *
         * @method addIds
         * @param {Array} ids A list of Ids
         */
        addIds: function(ids) {
            if (ids) {
                ids.forEach(function(id) {
                    // ES6 this.data.push({[this.id]:id});
                    // ES5
                    var obj = {};
                    obj[this.id] = id;
                    this.data.push(obj);
                }.bind(this));
                this.insertedIds = this.insertedIds.concat(ids);
            } else {
                this.data = [];
            }
        },

        /**
         * Add an unselected object to the list
         *
         * @method add
         * @param object An object from the list of objects that can be selected
         */
        add: function(object) {
            var objectId = object[this.id];
            var index = this.insertedIds.indexOf(objectId);
            if (index === -1) {
                // Add id to insertion order
                this.insertedIds.push(objectId);
                // Add data to data structure
                this.data.push(object);
            }
        },

        /**
         * Removes an object from the selection
         *
         * @method remove
         * @param object An object to remove
         */
        remove: function(object) {
            var index = this.insertedIds.indexOf(object[this.id]);
            if (index > -1) {
                // Remove id from insertion order
                this.insertedIds.splice(index, 1);
                // Remove data from data structure
                this.data.splice(index, 1);
            }
        },

        /**
         * Get the last selected id
         * Last in first out policy for attribute details.
         *
         * @method getLast
         * @return next id or undefined if nothing is selected.
         */
        getLast: function() {
            return this.insertedIds[this.insertedIds.length-1];
        }
    };

    return SelectionObject;
});
