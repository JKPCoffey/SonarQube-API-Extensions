define([
    'jscore/core',
    'jscore/ext/net',
    'container/api',
    './CollectionRenamerView',
    'networkexplorerlib/widgets/collectiondialog/CollectionDialog',
    'networkexplorerlib/widgets/inlineerror/InlineError',
    'networkexplorerlib/classes/CollectionErrorHandler',
    'networkexplorerlib/ObjectConfigurationApi',
    'i18n!networkexplorerlib/collectionrenamer.json'
], function(core, net, Container, View, CollectionDialog, InlineError, CollectionErrorHandler, ObjectConfigurationApi, strings) {

    /**
     * Shared Region
     *
     * @class CollectionRenamer
     */
    return core.Region.extend({

        View: View,

        /**
         * Create and initializes the widget fields.
         *
         * Uses:
         * - this.view
         * - this.inlineError
         */
        onViewReady: function() {

            if( !this.inlineError ) {
                this.inlineError = new InlineError();
                this.inlineError.attachTo(this.view.getInlineError());
            }

            this.view.getCollectionNameInput().addEventHandler('input', this.onCollectionNameInput, this);
            this.view.getCollectionNameInput().addEventHandler('invalid', this.onCollectionNameInvalid, this);
            this.view.getSubmitButton().addEventHandler('click', this.handleSubmit.bind(this));
            this.view.getCancelButton().addEventHandler('click', this.publishOperationDone.bind(this));
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
         * called when user digits characters in the collection name field.
         *
         * @private
         * @method onCollectionNameInput
         */
        onCollectionNameInput: function() {
            this.view.isCollectionNameValid();
        },

        /**
         * Callback called when html validation finds an error.
         *
         * @private
         * @method onInvalidCollectionName
         */
        onCollectionNameInvalid: function() {
            if (this.view.getCollectionNameValue() === '') {
                this.view.setInputStatusErrorText(strings.get('collectionNameRequired'));
            }
            this.view.getCollectionNameInput().focus();
        },

        /**
         * Calls REST Endpoint interface to rename a collection, then if success is received it sends a notification
         * to refresh the collection page to show the renamed collection, otherwise it opens a dialog box showing
         * the error message.
         *
         *
         * @private
         * @method updateExistingCollection
         * @param {Array} collectionData it contains the information (id, name) necessary to rename a collection
         */
        updateExistingCollection: function(collectionData) {
            Container.getEventBus().publish('container:loader');

            net.ajax({
                url: '/object-configuration/v1/collections/' + collectionData.id,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(collectionData),
                success: function  () {
                    Container.getEventBus().publish('container:loader-hide');
                    this.getEventBus().publish("collectionRenamer:rename-successful");
                }.bind(this),
                error: function (msg, xhr) {
                    Container.getEventBus().publish('container:loader-hide');
                    this.showRenameFailureDialog(strings.get('unableToRenameCollection'), CollectionErrorHandler.getErrorMessage(xhr));
                }.bind(this)
            });
        },

        /**
         * It gets the information necessary to rename a collection.
         * If a new name was specified, it sends a collection creation
         * request, otherwise it displays an error message.
         *
         * Uses:
         * - this.inlineError
         *
         * @private
         * @method handleSubmit
         */
        handleSubmit: function () {
            if( this.view.isCollectionNameValid() ) {
                this.inlineError.clear();
                this.updateExistingCollection({
                    name: this.view.getCollectionNameValue(),
                    id: this.options.id
                });
                this.publishOperationDone();
            } else {
                this.inlineError.set(strings.get('validationFail'));
            }
        },

        /**
         * Creates a Dialog Widget to show the details of a failure in the collection rename request.
         *
         * @private
         * @method showRenameFailureDialog
         * @param {String} header a string used as the Dialog header
         * @param {String|Widget} content a Widget or string used as the Dialog content
         */
        showRenameFailureDialog: function (header, content) {
            if (!this.renameFailureDialog) {
                this.renameFailureDialog = new CollectionDialog();
            }
            this.renameFailureDialog.show(header,content,strings);
        }
    });
});