define([
    'jscore/core',
    'container/api',
    'jscore/ext/net',
    './CollectionHandlerView',
    'i18n!networkexplorerlib/collectionhandler.json',
    'networkexplorerlib/regions/CollectionSelector',
    './widgets/ChooseCollection/ChooseCollection',
    'networkexplorerlib/widgets/insertcollection/InsertCollection',
    'widgets/Dialog',
    'networkexplorerlib/ObjectConfigurationApi'
], function(core, container, net, View, strings, CollectionSelector, ChooseCollection, InsertCollection, Dialog, ObjectConfigurationApi) {

    /**
     * Shared Region
     *
     * @class CollectionHandler
     */
    return core.Region.extend({

        View: View,

        /*
         * Internal Error Codes
         */
        NON_EXISTENT_COLL_ERROR: 10007,
        COLL_NAME_EXISTS_ERROR: 10011,
        COLL_NAME_MATCHES_MO_ERROR: 10012,
        COLL_SIZE_LIMIT_EXCEEDED_ERROR: 10022,
        TCS_ACCESS_DENIED: 10024,


        /*
         * Lifecycle method
         */
        init: function () {
            this.setOptions();
        },

        /*
         * Lifecycle method
         */
        onStart: function () {
            if (this.enableChooseCollection) {
                this.chooseCollection = new ChooseCollection({context: this.getContext()});
                this.chooseCollection.attachTo(this.view.getChooseBlock());
                this.chooseCollection.addEventHandler('ChooseCollection:newCollection', this.handleNewCollection, this);
                this.chooseCollection.addEventHandler('ChooseCollection:existingCollection', this.handleExistingCollection, this);
                this.chooseCollection.addEventHandler('ChooseCollection:replaceObjects', this.handleReplaceObjects, this);
            }
            if (this.enableInsertCollection) {
                this.insertCollection = new InsertCollection();
                this.insertCollection.attachTo(this.view.getInsertOrSelectBlock());
                this.insertCollection.addEventHandler('insertcollection:error-hide', this.handleCollectionNameInserted, this);
            }
            if (this.enableCollectionSelector) {
                this.collectionSelector = new CollectionSelector({
                    context: this.getContext(),
                    enableFullView: this.enableFullView,
                    onlyShowEditable: true,
                    enableMultipleSelection: this.enableMultipleSelection
                });
            }
            this.getEventBus().subscribe("CollectionSelector:collectionSelected", this.handleCollectionSelected, this);
            this.getEventBus().subscribe("CollectionSelector:collectionsLoaded", this.handleCollectionsLoaded, this);
            this.view.hideAddNoteBlock();
            this.hideInlineError();
        },

        /*
         * Lifecycle method
         */
        onStop: function() {
            core.Window.removeEventHandler(this.setHeightEventId);
        },

        /**
         * Initializes the Create and Cancel Buttons.
         *
         * Uses:
         * - this.view
         */
        onViewReady: function() {
            this.displayButtons = true;
            this.view.getSubmitButton().addEventHandler('click', this.handleSubmit.bind(this));
            this.view.getCancelButton().addEventHandler('click', this.handleCancel.bind(this));

            if (this.enableCollectionSelector) {
                this.setHeightEventId = core.Window.addEventHandler('resize', this.setHeightCollectionSelector.bind(this) );
                // Bug, allows events to fire
                core.Window._enableEvents = true;
            }
        },

        /**
         * Initializes the Create and Cancel Buttons.
         *
         * Uses:
         * - this.view
         */
        setHeightCollectionSelector: function() {
            if (this.collectionSelector && this.collectionSelector.isRunning()) {
                this.collectionSelector.setContentHeight( this.view.getInsertOrSelectBlock().getProperty('clientHeight') );
            }
        },

        /**
         * It sets some variables depending on operation type value.
         *
         * Uses:
         * - this.selectedCollection
         * - this.enableChooseCollection
         * - this.enableInsertCollection
         * - this.enableCollectionSelector
         * - this.enableFullView
         * - this.enableMultipleSelection
         *
         * @private
         * @method setOptions
         */
        setOptions: function () {
            this.displayButtons = false;
            this.enableFullView = false;
            this.enableChooseCollection = true;
            this.enableInsertCollection = true;
            this.enableCollectionSelector = true;
            this.enableMultipleSelection = false;
        },

        /**
         * Call when the layout of the "Add to existing" UI widgets changes.
         *
         * Uses:
         * - this.collectionSelector
         *
         * @private
         * @method onAddToExistingLayoutChange
         */
        onAddToExistingLayoutChange: function () {
            this.collectionSelector.onTableDataChanged();
            this.collectionSelector.retainCollectionsSelected();
        },

        /**
         * Callback for selected collection event.
         *
         * Uses:
         * - this.view
         * - this.collectionSelector
         * - this.selectedCollection
         *
         * @private
         * @method handleCollectionSelected
         * @param {Boolean} isSelected True if collection is selected, false when deselected
         * @param {Array} collections Objects providing info for a selected collection
         */
        handleCollectionSelected: function (isSelected, collections) {
            this.hideInlineError();
            this.onAddToExistingLayoutChange();
            if (isSelected) {
                this.selectedCollection = collections[0];
            } else {
                delete this.selectedCollection;
            }
        },

        /**
         * Callback for New Collection selection.
         *
         * Uses:
         * - this.view
         * - this.collectionSelector
         * - this.selectedCollection
         *
         * @private
         * @method handleNewCollection
         */
        handleNewCollection: function () {
            this.view.unsetTallContent();
            if (this.collectionSelector.isRunning()) {
                this.hideInlineError();
                this.collectionSelector.stop();
                delete this.selectedCollection;
            }
            if (!this.insertCollection.isAttached()) {
                this.insertCollection.attachTo(this.view.getInsertOrSelectBlock());
                this.view.hideAddNoteBlock();
            }
        },

        /**
         * Callback for Existing Collection selection.
         *
         * Uses:
         * - this.view
         * - this.insertCollection
         * - this.collectionSelector
         *
         * @private
         * @method handleExistingCollection
         */
        handleExistingCollection: function () {
            this.view.setTallContent();
            this.view.clearInputText();
            if (this.insertCollection.isAttached()) {
                this.hideInlineError();
                this.insertCollection.detach();
            }
            if (!this.collectionSelector.isRunning()) {
                this.collectionSelector.start(this.view.getInsertOrSelectBlock());
            }
        },

        /**
         * Callback to handle the InsertCollection:nameInserted event.
         *
         * Uses:
         * - this.view
         * - this.insertCollection
         *
         * @private
         * @method handleCollectionNameInserted
         */
        handleCollectionNameInserted: function() {
            this.hideInlineError();
        },

        /**
         * Callback to handle the CollectionSelector:collectionsLoaded event.
         *
         * Uses:
         * - this.view
         *
         * @method handleCollectionsLoaded
         */
        handleCollectionsLoaded: function() {
            this.view.showAddNoteBlock();
        },

        /**
         * Callback to handle the Replace Objects option for Existing Collection.
         *
         * Uses:
         * - this.replaceObjects
         *
         * @private
         * @method handleReplaceObjects
         * @param {Boolean} selected
         */
        handleReplaceObjects: function(selected) {
            this.replaceObjects = selected;
        },

        /**
         * Get collection data from json format
         *
         * @private
         * @method getUpdateCollectionData
         * @param {Array} collection the collection data as received from server in GET response
         * @return updatedCollection the collection data input for update operation
          */
        getUpdateCollectionData: function(collection) {
            var parsedCollection = JSON.parse(collection);
            parsedCollection.objects = parsedCollection.objects || [];
            var existingObjects = [];
            for (var entry = 0; entry < parsedCollection.objects.length; entry++) {
                existingObjects.push(parsedCollection.objects[entry].id);
            }
            parsedCollection.objects = this.getNewObjects(existingObjects);
            return parsedCollection;
        },

        /**
         * Success callback for GET collection
         *
         * Uses:
         * - this.selectedCollection
         *
         * @private
         * @method updateExistingCollection
         * @param {Array} collection
         */
        updateExistingCollection: function(collection) {
            container.getEventBus().publish('container:loader-hide');
            var updateCollection = this.getUpdateCollectionData(collection);
            this.httpRequest('/object-configuration/v1/collections/' + this.selectedCollection.id,
                'PUT',
                {
                    id: this.selectedCollection.id,
                    name: updateCollection.name,
                    userId: updateCollection.userId,
                    category: updateCollection.category,
                    objects: updateCollection.objects
                },
                function () {
                    this.notifyParentObject();
                });
        },

        /**
         * Checks if the form is enabled, then checks if a name is specified. If there is no name, a notification is
         * displayed, otherwise, gets all the poIds needed to create a collection and saves.
         *
         * Uses:
         * - this.view
         * - this.options
         * - this.selectedCollection
         * - this.insertCollection
         *
         * @private
         * @method handleSubmit
         */
        handleSubmit: function () {
            if (this.collectionSelector.isRunning()) {
                if (this.selectedCollection) {
                    // An existing collection has been selected, fetch data
                    container.getEventBus().publish('container:loader');
                    ObjectConfigurationApi.loadCollection({
                        params: {
                            request: {
                                id: this.selectedCollection.id
                            }
                        },
                        success: function (data) {
                            this.updateExistingCollection(data);
                        }.bind(this),
                        error: this.handleSubmitError.bind(this)
                    });
                } else {
                    this.view.setInlineErrorMessage(strings.get('selectNotificationError'));
                    this.view.showInlineError();
                    this.setHeightCollectionSelector();
                    this.onAddToExistingLayoutChange();
                }
            } else {
                if( this.insertCollection.validateCollectionName() ) {

                    this.httpRequest('/object-configuration/v1/collections',
                        'POST',
                        {
                            name: this.insertCollection.getCollectionName(),
                            category: this.insertCollection.getCategory(),
                            objects: this.convertsPoidArrayToObject(this.options.data)
                        },
                        function () {
                            this.notifyParentObject();
                        });
                }
                else {
                    this.showInlineError();
                }
            }
        },

        /**
         * Show a generic error message at top of flyout panel.
         *
         * Uses:
         * - this.view
         *
         * @private
         * @method showInlineError
         */
        showInlineError: function() {
            this.view.showInlineError();
            this.view.setInlineErrorMessage(strings.get('correctErrorsMessage'));
            this.setHeightCollectionSelector();
        },

        /**
         * Remove a generic error message at top of flyout panel.
         *
         * Uses:
         * - this.view
         *
         * @private
         * @method hideInlineError
         */
        hideInlineError: function() {
            this.view.hideInlineError();
            this.setHeightCollectionSelector();
        },

        /**
         * Calculates the new object list for add/remove objects to an existing collection (update)
         *
         * Uses:
         * - this.options
         * - this.replaceObjects
         *
         * @private
         * @method getNewObjects
         * @param {Array} existingObjectIds : the existing object ids for collection to update
         */
        getNewObjects: function (existingObjectIds) {
            var newObjectsIds = [];
            for (var selectedEntry = 0; selectedEntry < this.options.data.length; selectedEntry++) {
                newObjectsIds.push(this.options.data[selectedEntry]);
            }
            if (!this.replaceObjects) {
                for (var existingEntry = 0; existingEntry < existingObjectIds.length; existingEntry++) {
                    newObjectsIds.push(existingObjectIds[existingEntry]);
                }
            }
            return this.convertsPoidArrayToObject(newObjectsIds);
        },

        /**
         * Handles the pushing of Cancel button
         *
         * @private
         * @method handleCancel
         */
        handleCancel: function () {
            this.getEventBus().publish("CollectionHandler:operationDone");
        },

        /**
         * Handles the actual rest calls on a collection (to either get, update or create new) via net.ajax.
         *
         * Uses:
         * - this.options
         *
         * @private
         * @method httpRequest
         * @param {String} url
         * @param {String} type
         * @param {Object} data
         * @param {Function} successCallback
         */
        httpRequest: function (url, type, data, successCallback) {
            container.getEventBus().publish('container:loader');
            net.ajax({
                url: url,
                type: type,
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: successCallback.bind(this),
                error: this.handleSubmitError.bind(this)
            });
        },

        /**
         * Notify parent Region of change
         *
         * Uses:
         * - this.options
         *
         * @private
         * @method notifyParentObject
         */
        notifyParentObject: function() {
            container.getEventBus().publish('container:loader-hide');
            this.getEventBus().publish('CollectionHandler:showToast', {
                label: strings.get('objectsAdded').replace('$1', this.options.data.length),
                color: 'green',
                icon: 'tick',
                showAsToast: true,
                showCloseButton: true
            });
            this.getEventBus().publish('Results:entityCreated', 'collection');
            this.getEventBus().publish("CollectionHandler:operationDone");
        },

        /**
         * Get error message after unsuccessful attempt to connect to server.
         *
         * @private
         * @method getErrorMessage
         * @param {Object} xhr response from server
         * @return {Object} errorMessage
         */
        getErrorMessage: function(xhr) {
            var errorMessage;
            if (xhr.getStatusText() !== 'abort') {
                try {
                    errorMessage = JSON.parse(xhr.getResponseText());
                } catch (e) {
                    switch (xhr.getStatus()) {
                        case 503:
                            errorMessage = {
                                userMessage: {
                                    title: strings.get('serverTimeout503Header'),
                                    body: strings.get('serverTimeout503Body')
                                }
                            };
                            break;
                        case 504:
                            errorMessage = {
                                userMessage: {
                                    title: strings.get('serverTimeout504Header'),
                                    body: strings.get('serverTimeout504Body')
                                }
                            };
                            break;
                        // Default will catch 404, 500 and unknowns
                        default:
                            errorMessage = {
                                userMessage: {
                                    title: strings.get('unknownServerErrorHeader'),
                                    body: strings.get('unknownServerErrorParagraph')
                                }
                            };
                    }
                }
            }
            return errorMessage;
        },

        /**
         * Handler for errors received from REST while clicking "Add"
         *
         * Uses:
         * - strings
         * - container
         * - this.selectedCollection;
         * - this.collectionSelector
         *
         * @private
         * @method handleSubmitError
         * @param {String} msg
         * @param {Object} xhr
         */
        handleSubmitError: function(msg, xhr) {
            container.getEventBus().publish('container:loader-hide');
            var errorMessage = this.getErrorMessage(xhr);
            if(errorMessage.internalErrorCode === this.NON_EXISTENT_COLL_ERROR){
                this.showErrorDialog(strings.get('editCollectionErrorHeader'), strings.get('editCollectionErrorBody'));
                delete this.selectedCollection;
                this.collectionSelector.reload();
            }
            else if(errorMessage.internalErrorCode === this.COLL_SIZE_LIMIT_EXCEEDED_ERROR) {
                this.showErrorDialog(errorMessage.userMessage.title, errorMessage.userMessage.body);
            }
            else if(errorMessage.internalErrorCode === this.TCS_ACCESS_DENIED) {
                this.showErrorDialog(errorMessage.userMessage.title, errorMessage.userMessage.body);
                this.getEventBus().publish('CollectionHandler:operationDone');
            }
            else {
                if(errorMessage.internalErrorCode === this.COLL_NAME_EXISTS_ERROR ||
                    errorMessage.internalErrorCode === this.COLL_NAME_MATCHES_MO_ERROR) {
                    this.displayInlineError(xhr);
                } else {
                    var header = this.collectionSelector.isRunning() ? strings.get('unableToUpdateCollection') : strings.get('unableToCreateCollection');
                    this.showErrorDialog(header, errorMessage.internalErrorCode && errorMessage.userMessage ? errorMessage.userMessage.body : strings.get('unknownServerErrorParagraph'));

                }
            }
        },

        /**
         * Shows error dialog
         *
         * @private
         * @method showErrorDialog
         * @param {String} header
         * @param {String} messageContent
         */
        showErrorDialog: function (header, messageContent) {
            if(this.dialog) {
                this.dialog.destroy();
            }
            var dialog = new Dialog({
                header: header,
                content: messageContent,
                type: 'error',
                buttons: [{
                    caption: strings.get('ok'),
                    action: function () {
                        dialog.hide();
                        dialog.destroy();
                    },
                    color: 'darkBlue'
                }]
            });
            dialog.show();
            this.dialog = dialog;
        },

        /**
         * Display an inline error message based on the internal error code
         *
         * @private
         * @method displayInlineError
         * @param {Object} xhr
         */
        displayInlineError: function(xhr) {
            var message = this.getErrorMessage(xhr).internalErrorCode === this.COLL_NAME_EXISTS_ERROR ?
                strings.get('collectionNameAlreadyExists') : strings.get('collectionNameMatchesMO');
            this.showInlineError();
            this.insertCollection.showCollectionNameError(message);
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
        }
    });
});
