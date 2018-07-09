define([
    'jscore/core',
    './FileSelectorView',
    'widgets/Button',
    'i18n!bulkimportlib/fileselector.json'
], function(core, View, Button, strings ) {

    return core.Widget.extend({

        View: View,

        /*
         * Widget lifecycle method
         */
         onViewReady: function () {
            this.createSelectionButton();
        },

        /**
         * Called when a change occurs in the hidden file selection input.
         * If the change is due to a file selection then the file name is assigned to the visible file input element,
         * otherwise an empty string is assigned to it.
         *
         * @method onFileSelectionEvent
         */
        onFileSelectionEvent: function() {
            var selectedFile = this.getSelectedFile();
            var shownText = "";
            if (selectedFile) {
                shownText = selectedFile.name;
            }
            this.view.getFileName().setValue(shownText);
            this.view.removeFileError();
        },

        /**
         * Gets the file that was selected by the user, or undefined in case of no selection.
         *
         * @method getSelectedFile
         * @return{File} or undefined if no file was selected.
         */
        getSelectedFile: function() {
            return this.view.getFileSelectionInput().getProperty('files')[0];
        },

        /**
         * Verifies if a valid file was selected and displays an error message
         * if no file was selected.
         *
         * @method isValid
         * @return{Boolean} true if a valid file is selected, false otherwise.
         */
        isValid: function () {
            var selectedFile = this.getSelectedFile();
            if (selectedFile) {
                this.view.removeFileError();
                return true;
            }
            else {
                this.view.setFileError(strings.get('fileSelectionRequired'));
                return false;
            }
        },

        /**
         * Creating a custom and interactive fileselect button
         *
         * @method createSelectionButton
         */
        createSelectionButton: function () {
            this.fileSelectionButton = new Button({
                caption: strings.get('fileSelectionButton')
            });
            this.fileSelectionButton.attachTo(this.view.getFileSelectionButton());
            this.fileSelectionButton.addEventHandler("click", function () {
                this.view.getFileSelectionInput().trigger("click");
            }.bind(this));
            this.view.getFileName().addEventHandler("keydown", function (e) {
                // left arrow
                if (e.originalEvent.keyCode === 37) {
                    return true;
                }
                // right arrow
                else if (e.originalEvent.keyCode === 39) {
                    return true;
                } else {
                    e.preventDefault();
                }
            });
            this.view.getFileName().addEventHandler("click", function () {
                this.view.getFileSelectionButton().trigger("click");
            }.bind(this));
            this.view.getFileSelectionInput().addEventHandler("change", this.onFileSelectionEvent.bind(this));
        }
    });
});
