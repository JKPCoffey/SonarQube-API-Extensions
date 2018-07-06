define([
    "jscore/core",
    'jscore/ext/net',
    './InsertCollectionView',
    'i18n!networkexplorerlib/insertcollection.json'
], function(core, net, View, strings) {

    return core.Widget.extend({

        View: View,

        /*
         * Public constants
         */
        PRIVATE: "Private",
        PUBLIC: "Public",

        /*
         * Lifecycle method
         */
        onViewReady: function () {
            this.view.getCollectionNameInput().addEventHandler('input', this.onCollectionNameInput, this);
            this.view.getCollectionNameInput().addEventHandler('invalid', this.onCollectionNameInvalid, this);
        },

        /**
         * called when user digits characters in the collection name field.
         *
         * @private
         * @method onCollectionNameInput
         */
        onCollectionNameInput: function() {
            this.validateCollectionName();
        },

        /**
         * Callback called when html validation finds an error.
         *
         * @private
         * @method onInvalidCollectionName
         */
        onCollectionNameInvalid: function() {
            var status = this.view.getValidityStatus();
            if (status.valueMissing) {
                this.view.setInputStatusErrorText(strings.get('collectionNameRequired'));
            }
            this.view.getCollectionNameInput().focus();
        },

        /**
         * check the collection name inserted, if valid returns true else
         * returns false
         *
         * @method validateCollectionName
         */
        validateCollectionName: function() {
            this.view.removeCustomValidity();
            return this.view.isCollectionNameValid();
        },

        /**
         * Exports the collection name inserted
         *
         * @method getCollectionName
         * @return {String} The input field text value.
         */
        getCollectionName: function() {
            return this.view.getCollectionNameValue();
        },

        /**
         * Exports whether private or public category (sharing permission) has been selected by user
         * (private is the default)
         *
         * @method getCategory
         * @return {String} Private or Public.
         */
        getCategory: function() {
            return (this.view.isRadioPrivateChecked()) ? this.PRIVATE : this.PUBLIC;
        },

        /**
         * Show the message below collection name input field and put focus on input field
         *
         * @method showCollectionNameError
         * @param {string} message showed below the input box
         */
        showCollectionNameError: function(message) {
            this.view.setInputStatusErrorText(message);
            this.view.setCustomValidity(message);
            this.view.getCollectionNameInput().focus();
        }
    });
});