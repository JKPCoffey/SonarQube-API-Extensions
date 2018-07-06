define([
   'jscore/core',
   'jscore/ext/net'
], function (core,net) {

    /**
     *
     * The FavouriteManagementApi class allows applications to easily reuse the Favourite Configuration API.
     * This is a stateless class so there is no need to create a new instance, just import and use.
     *
     * @class FavouriteManagementApi
     */
    return {

        /**
         * isFavourite returns true if the poId passed is favourite.
         *
         * Uses:
         * - this.favouriteIds
         *
         * @public
         * @method isFavourite
         * @param {Number} id the id of a collection (poid)
         * @return {Boolean} true if collection is favorite, false otherwise
         */
        isFavourite: function(id) {
            if (this.favouriteIds) {
                for (var entry = 0; entry < this.favouriteIds.length; entry++) {
                    if (this.favouriteIds[entry] === id) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Do a REST call for get the list of favourite collections
         *
         * @public
         * @method fetchFavorite
         * @param {Object} options
         * @example
         *  fetchFavorite({
         *      success: function(favouriteIds) {
         *          this.dosomething();
         *      }.bind(this),
         *      error: function(message, xhr) {
         *          this.handleError(xhr);
         *      }.bind(this)
         *  });
         *
         * Optional parameter properties:
         * * success - a function that is called when the operation succeeds.
         * * error   - a function that is called when the operation failed.
         *
         */
        fetchFavourite: function(options) {
            net.ajax({
                url: '/rest/ui/settings/networkexplorer/favorites',
                type: 'GET',
                contentType: 'application/json',
                success: function(response) {
                    this.fetchFavouriteSuccess(response, options);
                }.bind(this),
                error: function(msg,xhr) {
                    this.handleSubmitError(msg, xhr, options);
                }.bind(this)
            });
        },

        /**
         * Callback to handle success case for get all favourite collections
         *
         * @private
         * @method fetchFavouriteSuccess
         *
         * @param {String} raw response from GET rest operation
         * @param {Object} options object passed from fetchFavourite
         *
         */
        fetchFavouriteSuccess: function(response, options) {
            var favorites = JSON.parse(response);
            this.favouriteIds = [];
            for (var entry = 0; entry < favorites.length; entry++) {
                if (favorites[entry].value) {
                    this.favouriteIds.push(favorites[entry].id);
                }
            }
            if (options.success) {
                options.success(this.favouriteIds);
            }
        },

        /**
         * set the favorite state of the given collections using REST.
         *
         * Uses:
         * - this.favouriteIds
         *
         * @method setFavourite
         * @param {Object} options
         * @example
         *  fetchFavorite({
         *      ids: [p1, p2, p3],
         *      favourite : favouriteToSet,
         *      eachsuccess: function(poId) {
         *          this.forEachFavouriteChanged(poId);
         *      }.bind(this),
         *      success: function(favouriteIds) {
         *          this.handleSuccess();
         *      }.bind(this),
         *      error: function(message, xhr) {
         *          this.handleError(xhr);
         *      }.bind(this)
         *      success: function(favouriteIds) {
         *          this.dosomething();
         *      }.bind(this),
         *      error: function(message, xhr) {
         *          this.handleError(xhr);
         *      }.bind(this)
         *  });
         *
         * Mandatory parameter properties:
         * ids - {Array|Object} collections ids to be set/unset as favourites
         * favourite - {Boolean} favourite state of selected collections to set
         *
         * Optional parameter properties:
         * * eachsuccess - a function that is called for each collection favourite state changed
         * * success - a function that is called when the operation succeeds, context holds the contents of the updated collection.
         * * failure - a function that is called when the operation failed.
         *
         */
        setFavourite: function(options) {
            if (Array.isArray(options.ids) && (typeof(options.favourite) === "boolean")) {
                options.poIds = options.ids.filter(function(id) {
                    return (this.favouriteIds.indexOf(id) > -1) !== options.favourite;
                }.bind(this));
                if (options.poIds.length) {
                    var settingObjects = options.poIds.map(function(id) {
                        return {"id": id, "value": options.favourite ? options.favourite + '' : ''};
                    });
                    this.putFavourites(settingObjects, options);
                }
            }
        },

        /**
         * Persists the favorite state for the given objects.
         * @param {Object} settingObjects
         * @param {Object} options
         */
        putFavourites: function(settingObjects, options) {
            net.ajax({
                url: '/rest/ui/settings/v2/networkexplorer/favorites',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(settingObjects),
                success: function() {
                    this.handlePutFavouritesSuccess(options.poIds, options, true);
                }.bind(this),
                error: function(msg,xhr) {
                    this.handlePutFavouritesFailure(msg, xhr, options);
                }.bind(this)
            });
        },

        /**
         * If REST resource is not found allow fallback to old end point to maintain backwards compatibility during upgrade.
         * Otherwise handle error.
         *
         * @param {String} msg
         * @param {Object} xhr
         * @param {Object} options
         */
        handlePutFavouritesFailure: function(msg, xhr, options) {
            var json;
            try {
                json = xhr.getResponseJSON();
            } catch(e) { /* response must be HTML */ }

            if(xhr.getStatus() === 404 || (!json && xhr.getStatus() === 403)) {
                options.poIds.forEach(function(id, index) {
                    this.putFavourite(id, options, !options.poIds[index+1]);
                }.bind(this));
            } else {
                this.handleSubmitError(msg, xhr, options);
            }
        },

        /**
         * persists the favorite state for the passed Pid using REST.
         *
         * Uses:
         * - this.favorites
         *
         * @private
         * @method putFavourite
         * @param {Number} poId: involved collections id
         * @param {Object} options object passed from setFavorite
         * @param {Boolean} finished: function return true at end of PUT series
         */
        putFavourite: function(poId, options, finished) {
            net.ajax({
                url: '/rest/ui/settings/networkexplorer/favorites',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: poId,
                    value: options.favourite ? options.favourite + '' : ''
                }),
                success: function() {
                    this.handlePutFavouritesSuccess([poId], options, finished);
                }.bind(this),
                error: function(msg,xhr) {
                    this.handleSubmitError(msg, xhr, options);
                }.bind(this)
            });
        },

        /**
         * Callback to handle success favorite state update using REST.
         *
         * Uses:
         * - this.favouriteIds
         *
         * @private
         * @method handlePutFavouritesSuccess
         * @param {Array} ids: List of ids completed
         * @param {Object} options object passed from setFavourite
         * @param {boolean} isFinished true if finished setting all favourites
         */
        handlePutFavouritesSuccess: function(ids, options, isFinished) {
            ids.forEach(function(id) {
                if(options.favourite) {
                    this.favouriteIds.push(id);
                } else {
                    this.favouriteIds.splice(this.favouriteIds.indexOf(id), 1);
                }

                if (options.eachsuccess) {
                    options.eachsuccess(id);
                }
            }.bind(this));
            if (options.success && isFinished) {
                options.success(options.poIds);
            }
        },

        /**
         * Handler for error while updating collection
         *
         * @private
         * @method handleSubmitError
         * @param {Object} xhr
         * @param {Object} options object
         *
         */
        handleSubmitError: function(msg, xhr, options) {
            if (options.error) {
                options.error(msg, xhr);
            }
        }

    };

});
