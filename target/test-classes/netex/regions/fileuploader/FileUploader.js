define([
    'jscore/core',
    'jscore/ext/net',
    'container/api',
    './FileUploaderView',
    'widgets/Dialog',
    'networkexplorerlib/widgets/fileselector/FileSelector',
    'networkexplorerlib/widgets/collectionfromfileresultdetails/CollectionFromFileResultDetails',
    'networkexplorerlib/widgets/collectionfromfileresultdescription/CollectionFromFileResultDescription',
    'networkexplorerlib/classes/CollectionErrorHandler',
    'i18n!networkexplorerlib/fileuploader.json'
], function(core, net, Container, View, Dialog, FileSelector, CollectionFromFileResultDetails, //NOSONAR
            CollectionFromFileResultDescription, CollectionErrorHandler, strings ) {

    /**
     * Shared Region
     *
     * @class FileUploader
     */
    return core.Region.extend({

        View: View,

        /*
         * Region lifecycle method
         */
        init: function() {
            this.notifyAddedCount = -1;
            this.collectionNotPresent = false;
            this.isCollectionModified = false;
        },

        /*
         * Region lifecycle method
         */
        onStart: function() {
            this.fileSelector = new FileSelector();
            this.fileSelector.attachTo(this.view.getFileSelector());
        },

        /*
         * Region lifecycle method
         */
        onStop: function() {
           this.fileSelector.destroy();
        },

        /**
         * Checks that a file has been selected and if no file has been picked it displays an error message.
         * If just file validation is required it stops, otherwise it uploads the file onto the server,
         * together with the data required to create a new collection from the file.
         *
         * @method send
         * @param {Object} collectionData it contains the information necessary to create a collection (name, category)
         * @param {Boolean} onlyValidation if true just the validation procedure is executed
         */
        send: function (collectionData, onlyValidation) {
            if( collectionData.id && !this.fileSelector.isValid() ) {
                throw new Error(strings.get('selectNotificationError'));
            }

            if (collectionData.name) {
                this.collectionName = collectionData.name;
            }

            if( !onlyValidation ) {
                Container.getEventBus().publish('container:loader');
                this.sendFile(collectionData);
            }
        },

        /**
         * Checks if a file has been selected.
         *
         * @method isFileSelected
         * @return {Boolean} true if a file has been selected, false otherwise
         */
        isFileSelected: function () {
            return (this.fileSelector.getSelectedFile() !== undefined);
        },

        /**
         * Calls REST Endpoint interface to upload the file onto the server,
         * together with the data required to create a new collection from the file.
         *
         * @private
         * @method sendFile
         * @param {Object} collectionData it contains the information necessary to create a collection (name, category)
         */
        sendFile: function (collectionData) {
            var data = new FormData();
            var sendType;
            this.isDeleteCollection = false;
            this.isCollectionModified = false;

            if( collectionData.id ) {
                this.isReplaceSelected = collectionData.replace;
                this.isCreateCollection = false;
                data.append("collectionId", collectionData.id);
                data.append("replace", collectionData.replace);
                sendType = "PUT";
            } else {
                this.isReplaceSelected = false;
                this.isCreateCollection = true;
                // creation of a new Collection, it isn't present on the table.
                this.collectionNotPresent = true;
                data.append("collectionName", collectionData.name );
                data.append("collectionCategory", collectionData.category );
                sendType = "POST";
            }

            data.append("file", this.fileSelector.getSelectedFile());

            net.ajax({
                url: "/network-explorer-import/v1/collections/file",
                type: sendType,
                contentType: false,
                processData: false,
                data: data,
                dataType: "json",
                success: this.onSuccess.bind(this),
                error: this.onError.bind(this)
            });
        },

        /**
         * Success callback for the REST call.
         * In case at least one failure occurred while adding objects to the collection, a list of detailed
         * error messages (one for each failure) is built and shown in a dialog box.
         *
         * @private
         * @method onSuccess
         * @param {Object} data the response content
         */
        onSuccess: function (data) {
            this.isCreateOnSuccess = true;
            this.notifyAddedCount = data.added;
            if (data.failed > 0) {
                this.onSuccessPartial(data);
            } else {
                if (!this.isCreateCollection && (this.isReplaceSelected || data.added > 0)) {
                    this.isCollectionModified = true;
                }
                Container.getEventBus().publish('container:loader-hide');
                this.notifyUpdateAvailable();
            }
        },

        onSuccessPartial: function(data){
            this.collectionIdCreatedWithFailures = data.collection.id;

            var convertedFailures = data.failures.map(function(failure) {
                return {
                    name: failure.object,
                    reason: CollectionErrorHandler.getFailureReasonDetails(failure.cause)
                };
            });

            var resultDetails = new CollectionFromFileResultDetails({
                fileName: this.fileSelector.getSelectedFile().name,
                added: data.added,
                failed: data.failed,
                failures: convertedFailures
            });
            Container.getEventBus().publish('container:loader-hide');

            var header; //String
            if(this.isCreateCollection) {
                header = data.added > 0 ? strings.get('unableToAddAllObjectsToNewCollection') :
                    strings.get('unableToAddObjectsToNewCollection');
            } else {
                header = data.added > 0 ? strings.get('unableToAddAllObjectsToExistingCollection') :
                    strings.get('unableToAddObjectsToExistingCollection');

                if(this.isReplaceSelected || data.added > 0) {
                    this.isCollectionModified = true;
                }
            }
            this.createDialog(header, this.getWarningMessageWidget(this.isCreateCollection, data.added), resultDetails);
        },

        /**
         * It provides a message containing the information that some objects couldn't be added to a new or existing collection.
         *
         * @private
         * @method getWarningMessageWidget
         * @param {Boolean} isCreateCollection true if a Create Collection operation is occurring, false otherwise.
         * @return {CollectionFromFileResultDescription} the warning message widget
         */
        getWarningMessageWidget: function (isCreateCollection, added) {
            var message;
            if (isCreateCollection) {
                message = added > 0 ? strings.get('createCollectionWarningMessage').replace('$1', this.collectionName)
                        .replace('$2', strings.get('warningSomeLowerCase'))
                    : strings.get('createCollectionWarningMessage').replace('$1', this.collectionName)
                        .replace('$2', strings.get('warningTheLowerCase'));
            } else {
                message = added > 0 ? strings.get('someObjectsNotAdded').replace('$1', strings.get('warningSomeUpperCase'))
                    : strings.get('someObjectsNotAdded').replace('$1', strings.get('warningTheUpperCase'));
            }
            return new CollectionFromFileResultDescription({message: message, width: "500px"});
        },

        /**
         * Error callback for the REST call. It shows a dialog box with the specific error message.
         *
         * @private
         * @method onError
         * @param {String} msg the response error message
         * @param {Object} xhr the XHR
         */
        onError: function (msg, xhr) {
            this.isCreateOnSuccess = false;
            Container.getEventBus().publish('container:loader-hide');
            var errorMessage = CollectionErrorHandler.getErrorMessage(xhr);

            if (CollectionErrorHandler.isErrorOfTypeNonExistentCollection(xhr)) {
                // the collection doesn't exists anymore, signal to the table.
                this.collectionNotPresent = true;
            }
            var header = this.isCreateCollection ? strings.get('unableToCreateCollection') : strings.get('unableToUpdateCollection');
            this.createDialog(header, errorMessage);
        },

        /**
         * Creates a dialog box that shows a global failure message in case an error is received from the server,
         * or a list of errors (one for each failed object) in case success is received from the server
         * but at least one object was not added.
         *
         * @private
         * @method createDialog
         */
        createDialog: function (header, content, optionalContent) {
            if (!this.dialog) {
                this.dialog = new Dialog({
                    header: header,
                    content: content,
                    optionalContent: optionalContent,
                    type: "error",
                    buttons: this.createDialogButtons(),
                    visible: true
                });
            }
        },

        /**
         * Create dynamically and return dialog buttons.
         *
         * @return{Array}
         */
        createDialogButtons: function() {
            var buttons; // Array
            if(this.isCreateCollection && this.isCreateOnSuccess) {
                buttons = [{
                    caption: strings.get('ok'),
                    action: this.closeDialog.bind(this)
                }, {
                    caption: strings.get('deleteCollection'),
                    action: this.deleteCollectionCall.bind(this)
                }];
            } else {
                buttons = [{
                    caption: strings.get('ok'),
                    action: this.closeDialog.bind(this)
                }];
            }
            return buttons;
        },

        /**
         * Closes the dialog box.
         *
         * @private
         * @method closeDialog
         */
        closeDialog: function () {
            this.notifyUpdateAvailable();
            if (this.dialog) {
                this.dialog.hide();
                this.dialog = undefined;
            }
        },

        /**
         * Delete the created Collection.
         *
         * @private
         * @method deleteCollectionCall
         */
        deleteCollectionCall: function () {
            var resourceURL = "/object-configuration/v1/collections";
            this.xhr = net.ajax({
                type: 'DELETE',
                url: resourceURL + '/' + this.collectionIdCreatedWithFailures,
                success: this.deleteSelectedSuccess.bind(this),
                error: this.deleteSelectedError.bind(this)
            });
        },

        /**
         * Success delete of the created Collection.
         *
         * @private
         * @method deleteSelectedSuccess
         */
        deleteSelectedSuccess: function () {
            this.isDeleteCollection = true;
            // the new collection has been deleted, the table is updated.
            this.collectionNotPresent = false;
            this.closeDialog();
        },

        /**
         * Error delete of the created Collection.
         *
         * @private
         * @method deleteSelectedError
         */
        deleteSelectedError: function () {
            if (this.dialog) {
                this.dialog.hide();
                this.dialog = undefined;
            }
            this.createErrorDeleteDialog();
        },

        /**
         * Creates the Dialog Widget to show the details of a failure in the collection deleted request.
         *
         * @private
         * @method createErrorDeleteDialog
         */
        createErrorDeleteDialog: function () {
            if (!this.dialog) {
                this.dialog = new Dialog({
                    header: strings.get('deleteErrorHeading'),
                    content: strings.get('deleteErrorBody'),
                    type: "error",
                    buttons: [{
                        caption: strings.get('ok'),
                        action: this.closeDialog.bind(this)
                    }],
                    visible: true
                });
            }
        },

        /**
         * Sends a notification containing the following info:
         * - number of added objects (or -1 in case no object was added to the collection)
         * - operation type
         * - the collection is not present in collection's list on display
         *
         * Uses:
         * - this.notifyAddedCount
         * - this.collectionNotPresent
         *
         * @private
         * @method notifyUpdateAvailable
         */
        notifyUpdateAvailable: function() {
            if ((this.notifyAddedCount > -1) || this.collectionNotPresent) {
                var newAction = this.isCreateCollection ? 'create' : 'update';
                this.getEventBus().publish("fileuploader:result", {
                    result: this.notifyAddedCount,
                    operation: this.isDeleteCollection ? 'deleteAfterCreate' : newAction,
                    collectionNotPresent: this.collectionNotPresent,
                    isCollectionModified: this.isCollectionModified
                });
            }
        }
    });
});