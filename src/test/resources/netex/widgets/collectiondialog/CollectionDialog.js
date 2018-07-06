define([
    'jscore/core',
    'widgets/Dialog'
], function(core, Dialog) {

    /**
     * A generic Dialog for Collection operations
     *
     * @class CollectionDialog
     * @param {Object} options An object with the following configuration options:
     *          {Function} onClose a callback that triggers when the dialog is closed
     */
    var CollectionDialog = function (options) {
        this.options = options;
    };

    /**
     * Creates a Dialog to show the details of a failure in the collection related request.
     * Does not show a new dialog if one already exists.
     *
     * @public
     * @method show
     * @param {String} header a string used as the Dialog header
     * @param {String|Widget} content a Widget or string used as the Dialog content
     */
    CollectionDialog.prototype.show = function (header, content, strings) {
        if (!this.dialog) {
            this.dialog = new Dialog({
                header: header,
                content: content,
                type: "error",
                buttons: [{
                    caption: strings.get('ok'),
                    action: this.close.bind(this)
                }],
                visible: true
            });
        }
    };

    /**
     * On Create dialog close sends a notification that no objects were inserted in the collection
     *
     * @public
     * @method close
     */
    CollectionDialog.prototype.close = function () {
        if (this.dialog) {
            this.dialog.hide();
            this.dialog = undefined;
        }
        if (this.options && this.options.onClose instanceof Function) {
            this.options.onClose();
        }
    };

    return CollectionDialog;
});

