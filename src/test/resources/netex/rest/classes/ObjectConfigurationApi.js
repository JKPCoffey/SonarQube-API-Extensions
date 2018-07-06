define([
   'jscore/core',
   'jscore/ext/net',
   'i18n!networkexplorerlib/collectionhandler.json',
    'i18n/number'
], function (core,net,strings, number) {

    /**
     * ## Usage
     *
     * The ObjectConfigurationApi class allows applications to easily reuse the Object Configuration API.
     * This is a stateless class so there is no need to create a new instance, just import and use.
     *
     * It provides convenience methods for the following flows:
     *
     * ##### Get collection:
     * Retrieve collection data.
     *
     * ##### Add a new collection:
     * Provide the name and sharing category of the collection you wish to create, with an optional array of objects to be added.
     * A success callback you define will be called if the objects are removed from the collection.
     * An error callback will be called if:
     * * the collection with same name already exist ????
     *
     * ##### Removing objects from an existing collection:
     * Provide the identity of the collection you wish to update and an array of objects that you wish to remove.
     * A success callback you define will be called if the objects are removed from the collection.
     * An error callback will be called if:
     * * the collection does not exist
     * * the collection is public and the user is not an administrator
     * * the collection is private and the user is not the owner
     *
     * ##### Adding objects to an existing collection:
     * Provide the identity of the collection you wish to update and an array of objects that you wish to add.
     *
     * ##### Replacing objects in an existing collection:
     * Provide the identity of the collection you wish to update and an array of objects that you wish it to contain.
     *
     * @class ObjectConfigurationApi
     */
    return {
        REST_ENDPOINT_URL: ['/object-configuration/collections/v2',
                            '/object-configuration/v1/collections'],

        /**
         * Retrieve collection data.
         *
         * @public
         * @method loadCollection
         * @param options {Object}
         *           params {Object}
         *               query {Object} (optional)
         *                  includeMappings {true|false} (optional, default false) true get attribute other poid
         *                  orderBy {String} (optional) field name
         *                  orderDirection {'asc'|'desc'} (optional) direction of ordering
         *               request {Object} (optional)
         *                  id {String}
         *           success {Object} callback called when get successfull end
         *           error {Object} callback called when get end whith error
         */
        loadCollection: function(options) {
            var pathParamAndQueryString = "";

            if( options.params ) {
                if( options.params.request && options.params.request.id ) {
                    pathParamAndQueryString += '/' + options.params.request.id;
                }
                pathParamAndQueryString += this.createQueryString(options.params.query);
            }

            this.loadCollectionExecuteFetch({
                restEndPointIndex: 0,
                pathParamAndQueryString: pathParamAndQueryString,
                dataType: options.dataType,
                success: options.success,
                error: options.error
            });
        },

        /**
         * This method creates the query string to append at the url.
         *
         * @private
         * @method createQueryString
         * @param queryParams {Object}
         *           includeMappings {true|false} (optional, default false) true get attribute other poid
         *           orderBy {String} (optional) field name
         *           orderDirection {'asc'|'desc'} (optional) direction of ordering
         */
        createQueryString: function(queryParams) {
            var queryString = "";

            if( queryParams ) {
                var queryStringOption = [];
                if( queryParams.includeMappings ) {
                    queryStringOption.push(queryParams.includeMappings ? 'includeMappings=true' : '');
                }

                if( queryParams.orderBy ) {
                    queryStringOption.push(queryParams.orderBy ? 'orderby=' + queryParams.orderBy : '');
                }

                if( queryParams.orderDirection ) {
                    queryStringOption.push(queryParams.orderDirection ? 'orderdirection=' + queryParams.orderDirection : '');
                }

                queryStringOption.forEach(function(queryData){
                    queryString += (queryString==="" ? '?' : '&') + queryData;
                });
            }

            return queryString;
        },

        /**
         * Executed when NetworkExplorer:collection load is triggered.
         *
         * Uses:
         * - this.REST_ENDPOINT_URL
         * - this.loadCollectionFetchData
         */
        loadCollectionExecuteFetch: function(fetchData) {
            net.ajax({
                url: this.REST_ENDPOINT_URL[fetchData.restEndPointIndex] + fetchData.pathParamAndQueryString,
                type: 'GET',
                dataType: fetchData.dataType,
                contentType: 'application/json',
                success: fetchData.success,
                error: function(collection, xhr) {
                    this.loadCollectionExecuteFetchError(fetchData, collection, xhr);
                }.bind(this)
            });
        },

        /**
         * Executed when NetworkExplorer:collection load goes in error.
         * Managed the error type received to evaluate if it's the case to invoke the
         * same request on older endpoint or to managed the error itself.
         *
         * Uses:
         * - this.REST_ENDPOINT_URL
         * - this.loadCollectionFetchData
         *
         * @param collection
         * @param xhr
         */
        loadCollectionExecuteFetchError: function(fetchData, collection, xhr) {
            if (this.isLoadCollectionV2EndPointUnavailable(xhr) && this.REST_ENDPOINT_URL[++fetchData.restEndPointIndex]) {
                this.loadCollectionExecuteFetch(fetchData);
            } else {
                fetchData.error(collection, xhr);
            }
        },

        /**
         * This method evaluates if the load collection v2 endpoint unavailable.
         *
         * @param xhr
         */
        isLoadCollectionV2EndPointUnavailable: function(xhr) {
            var errorBody;
            try {
                errorBody = JSON.parse(xhr.getResponseText());
            } catch (e) {
                return false;
            }

            return (xhr.getStatus()===400) && errorBody.internalErrorCode===10032;
        },


        /**
         * Create a new collection, optionally filled with a given list of object.
         *
         * Required parameter properties:
         * * collectionData - object with the new collection info, should contain:
         * * * name - the new collection name, mandatory.
         * * * category - the new collection sharing category, one of Public and Private, mandatory.
         * * * objects - an array of objects describing the contents of the new collection, optional.
         *
         * Optional parameter properties:
         * * onSuccess - a function that is called when the operation succeeds, context holds the contents of the updated collection.
         * * onFailure - a function that is called when the operation failed.
         *
         * @public
         * @method createCollection
         * @param {Object} options
         * @example
         *      collectionCreate({
         *          collectionData: {
         *              name: 'myCollection'
         *              category: 'Public'
         *              objects: [
         *                  {
         *                    id: '123'
         *                  },
         *                  {
         *                    id: '456'
         *                  },
         *                  {
         *                    id: '789'
         *                  }
         *              ],
         *          },
         *          onSuccess: function(data) {
         *              // show success message
         *          },
         *          onFailure: function(msg,xhr) {
         *              // show error dialog
         *          }
         *      });
         */
        createCollection: function(options) {
            this.httpRequest('/object-configuration/v1/collections/',
                    'POST',
                    options.collectionData,
                    options.onSucess,
                    options.onFailure
            );
        },

        /**
         * Removes selected objects from a collection that the current user has permission to update.
         *
         * Required parameter properties:
         * * collection - an object representing the collection. Identification by the id property is supported.
         * * objects - an array of objects describing some or all of the contents of the collection.
         *
         * Optional parameter properties:
         * * onSuccess - a function that is called when the operation succeeds, context holds the contents of the updated collection.
         * * onFailure - a function that is called when the operation failed.
         *
         * @public
         * @method removeObjects
         * @param {Object} options
         * @example
         *      removeObjects({
         *          collection: {
         *              id: '1234567890'
         *          },
         *          objects: [
         *              {
         *                id: '123'
         *              },
         *              {
         *                id: '456'
         *              },
         *              {
         *                id: '789'
         *              }
         *          ],
         *          onSuccess: function(data) {
         *              // show success message
         *          },
         *          onFailure: function(msg,xhr) {
         *              // show error dialog
         *          }
         *      });
         */
        removeObjects: function(options) {
            this.objectsTobeRemoved = options.objects;
            this.loadCollection({
                params: {
                    request: {
                        id: options.collection.id
                    }
                },
                success: function (data) {
                    this.updateExistingCollection(data,options.onSuccess,options.onFailure);
                }.bind(this),
                error: function (msg,xhr) {
                    this.handleSubmitError(xhr, options.onFailure);
                }.bind(this)
            });
        },

        /**
         * This method is used as success callback for GET collection and will update the collection
         * with remaining objects present in the collection.
         *
         * @private
         * @method updateExistingCollection
         * @param {Object} collection
         * @param {Object} sucessCallback
         * @param {Object} failureCallback
         */
        updateExistingCollection: function(collection,sucessCallback,failureCallback) {
            var parsedCollection = JSON.parse(collection);
            if(parsedCollection.objects && parsedCollection.objects.length !== 0){
                var updateCollection = this.getUpdateCollectionData(parsedCollection);
                this.httpRequest(
                    '/object-configuration/v1/collections/' + parsedCollection.id,
                    'PUT',
                    {
                        id: updateCollection.id,
                        name: updateCollection.name,
                        type: updateCollection.type,
                        userId: updateCollection.userId,
                        category: updateCollection.category,
                        readOnly: updateCollection.readOnly,
                        objects: updateCollection.objects
                    },
                    function () {
                        this.notifyParentObject(sucessCallback);
                    },
                    function (msg,xhr) {
                        this.handleSubmitError(xhr, failureCallback);
                    }
                );
            } else {
                this.notifyParentObject(sucessCallback);
            }
        },

        /**
         * Handler for error while updating collection
         *
         * @private
         * @method handleSubmitError
         * @param {Object} xhr
         * @param {Object} failureCallBack
         */
        handleSubmitError: function(xhr, failureCallBack) {
            failureCallBack(xhr);
        },

        /**
         * Calculates the new object list for add/remove objects to an existing collection (update)
         *
         * Uses:
         * - this.objectsTobeRemoved
         *
         * @private
         * @method getNewObjects
         * @param existingObjectIds : the existing object ids for collection to update
         */
        getNewObjects: function (existingObjectIds) {
            var newObjectsIds;
            var existingObjectIdsTemp = existingObjectIds.slice();
            var selectedEntry;
            for (selectedEntry = 0; selectedEntry < this.objectsTobeRemoved.length; selectedEntry++) {
                var index = existingObjectIdsTemp.indexOf(this.objectsTobeRemoved[selectedEntry]);
                if(index !== -1) {
                    existingObjectIdsTemp.splice(index, 1);
                }
            }
            newObjectsIds = existingObjectIdsTemp;
            return this.convertsPoidArrayToObject(newObjectsIds);
        },

        /**
         * Function to convert poId Array to Objects
         *
         * @private
         * @method convertsPoidArrayToObject
         * @param {Array} objectsIds
         */
        convertsPoidArrayToObject: function(objectsIds) {
            return objectsIds.map(function(e) { return {id:e}; });
        },

        /**
         * Notify parent Region of change
         *
         * @private
         * @method notifyParentObject
         */
        notifyParentObject: function(callback) {
            var numberOfObjectsRemoved = number(this.objectsTobeRemoved.length).format('0,0');
            var label = strings.get('objectsRemoved').replace('$1', numberOfObjectsRemoved);
            callback(label);
        },

        /**
         * Handles the actual rest calls on a collection (to either get, update or create new) via net.ajax.
         *
         * @private
         * @method httpRequest
         * @param {String} url
         * @param {String} type
         * @param {Function} successCallback
         * @param {Object} data
         */
        httpRequest: function (url, type, data, successCallback, errorCallback) {
            net.ajax({
                url: url,
                type: type,
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: successCallback.bind(this),
                error: errorCallback.bind(this)
            });
        },

        /**
         * Returns the collection containing remaining Id's of Managed Objects after removing the
         * Managed Object Id's selected by the user for removal from the collection
         *
         * @private
         * @method getUpdateCollectionData
         * @param parsedCollection : the collection data as received from server in GET response
         * @return the collection data input for update operation
         *
         */
        getUpdateCollectionData: function(parsedCollection) {
            var existingObjects = [];
            for (var entry = 0; entry < parsedCollection.objects.length; entry++) {
                existingObjects.push(parsedCollection.objects[entry].id);
            }
            parsedCollection.objects = this.getNewObjects(existingObjects);
            return parsedCollection;
        }
     };

});