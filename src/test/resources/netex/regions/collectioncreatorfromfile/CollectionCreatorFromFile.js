define([
    'jscore/core',
    'jscore/ext/net',
    'container/api',
    'networkexplorerlib/widgets/collectiondialog/CollectionDialog',
    './CollectionCreatorFromFileView',
    'networkexplorerlib/widgets/inlineerror/InlineError',
    'networkexplorerlib/widgets/insertcollection/InsertCollection',
    'networkexplorerlib/regions/fileuploader/FileUploader',
    'networkexplorerlib/classes/CollectionErrorHandler',
    'networkexplorerlib/ObjectConfigurationApi',
    'i18n!networkexplorerlib/collectionfromfile.json'
], function(core, net, Container, CollectionDialog, View, InlineError, InsertCollection, FileUploader, CollectionErrorHandler, ObjectConfigurationApi, strings) {

    /**
     * Shared Region
     *
     * @class CollectionCreatorFromFile
     */
    return core.Region.extend({

        View: View,


        /*
         * Region lifecycle method
         */
        onStart: function() {

            if( !this.fileUploader ) {
                this.fileUploader = new FileUploader({
                    context: this.getContext()
                });
            }
            this.fileUploader.start(this.view.getFileUploader());
         },


        /**
         * Initializes the Create and Cancel Buttons.
         *
         * Uses:
         * - this.view
         * - this.insertCollection
         * - this.inlineError
         */
        onViewReady: function() {
            if (!this.insertCollection) {
                this.insertCollection = new InsertCollection();
                this.insertCollection.addEventHandler('insertcollection:error-hide', this.clearInLineError, this);
                this.insertCollection.attachTo(this.view.getInsertCollection());
            }

            if( !this.inlineError ) {
                this.inlineError = new InlineError();
            }
            this.inlineError.attachTo(this.view.getInlineError());

            this.view.getSubmitButton().addEventHandler('click', this.handleSubmit.bind(this));
            this.view.getCancelButton().addEventHandler('click', this.publishOperationDone.bind(this));
        },


        /*
         * Region lifecycle method
         */
        onStop: function() {
           this.fileUploader.stop();
        },


        /**
         * Notifies that the component can be undisplayed.
         *
         * @private
         * @method publishOperationDone
         */
        publishOperationDone: function () {
            this.getEventBus().publish("collection:operation-done");
        },


        /**
         * Clears the inline error condition.
         *
         * @private
         * @method clearInLineError
         */
        clearInLineError: function () {
            this.inlineError.clear();
        },


        /**
         * Calls REST Endpoint interface to create an empty collection, then if success is received it sends a notification
         * to refresh the collection page to show the new collection, otherwise it opens a dialog box showing the error message.
         *
         * @private
         * @method sendEmptyCollectionCreate
         * @param {Object} collectionData it contains the information (name, category) necessary to create an empty collection
         */
        sendEmptyCollectionCreate: function (collectionData) {
            Container.getEventBus().publish('container:loader');
            ObjectConfigurationApi.createCollection({
                collectionData: collectionData,
                onSucess: function () {
                    Container.getEventBus().publish('container:loader-hide');
                    this.getEventBus().publish("fileuploader:result", {result: 0, operation: 'create', collectionNotPresent: true});
                }.bind(this),
                onFailure: function (msg, xhr) {
                    Container.getEventBus().publish('container:loader-hide');

                    var errorMessage = CollectionErrorHandler.getErrorMessage(xhr);

                    this.showCreationFailureDialog(strings.get('unableToCreateEmptyCollection'), errorMessage);

                }.bind(this)
             });
        },


        /**
         * It gets the information necessary to the creation of a collection.
         * If the required data are available and a file has been selected,
         * it invokes the File Uploader component to send a collection creation
         * request, otherwise it sends an empty collection creation request.
         * If an error occurs it displays an error message.
         *
         * Uses:
         * - this.fileUploader
         * - this.insertCollection
         * - this.inlineError
         *
         * @private
         * @method handleSubmit
         */
        handleSubmit: function () {
            var collectionData = {};
            if( this.insertCollection.validateCollectionName() ) {
                collectionData.name = this.insertCollection.getCollectionName();
                collectionData.category = this.insertCollection.getCategory();
                if (this.fileUploader.isFileSelected()) {
                    this.fileUploader.send(collectionData);
                } else {
                    this.sendEmptyCollectionCreate(collectionData);
                }
                this.publishOperationDone();
            } else {
                this.inlineError.set(strings.get('validationFail'));
            }
        },

        /**
         * Creates a Dialog Widget to show the details of a failure in the collection creation request.
         *
         * @private
         * @method showCreationFailureDialog
         * @param {String} header a string used as the Dialog header
         * @param {String|Widget} content a Widget or string used as the Dialog content
         */
        showCreationFailureDialog: function (header, content) {
            if (!this.creationFailureDialog) {
                this.creationFailureDialog = new CollectionDialog({
                    onClose: this.onCreationFailure.bind(this)
                });
            }
            this.creationFailureDialog.show(header,content,strings);
        },

        /**
         * Send a notification that no objects were inserted in the collection
         *
         * @private
         * @method onCreationFailure
         */
        onCreationFailure: function () {
            this.getEventBus().publish("fileuploader:result", { result: -1, operation: 'create', collectionNotPresent: false});
        }
    });
});