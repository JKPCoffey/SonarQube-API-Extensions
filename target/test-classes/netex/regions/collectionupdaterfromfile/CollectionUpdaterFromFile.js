define([
    'jscore/core',
    'jscore/ext/net',
    './CollectionUpdaterFromFileView',
    'networkexplorerlib/widgets/inlineerror/InlineError',
    '../fileuploader/FileUploader',
    'i18n!networkexplorerlib/collectionfromfile.json'
], function(core, net, View, InlineError, FileUploader, strings) {

    /**
     * Shared Region
     *
     * @class CollectionUpdaterFromFile
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
                this.initializeButtons();
            }

            if (!this.inlineError) {
                this.inlineError = new InlineError();
                this.inlineError.attachTo(this.view.getInlineError());
            }

            this.fileUploader.start(this.view.getFileUploader());
         },


        /*
         * Region lifecycle method
         */
        onStop: function() {
           this.fileUploader.stop();
        },


        /**
         * Initializes the Add and Cancel Buttons.
         *
         * Uses:
         * - this.view
         * - this.submitButton
         * - this.cancelButton
         *
         * @private
         * @method initializeButtons
         */
        initializeButtons: function() {
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
         * Checks if a file has been selected and if no file has been picked
         * it displays an error message, otherwise it invokes the File Uploader component
         * to send the collection update request to the server.
         *
         * Uses:
         * - this.fileUploader
         * - this.inlineError
         *
         * @private
         * @method handleSubmit
         */
        handleSubmit: function () {
            try{
                this.fileUploader.send({
                    id: this.options.id,
                    replace: this.view.isReplaceCheckboxSelected()
                });
                this.publishOperationDone();
            } catch( e ) {
                this.inlineError.set(strings.get('validationFail'));
            }
        }
    });
});