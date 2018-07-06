define([
    'widgets/ItemsControl',
    './SimpleSearchInputView'
], function (ItemsControl, View) {

    return ItemsControl.extend({

        View: View,

        /**
         * Lifecycle Method
         */
        onControlReady: function () {
            // Hide the cancel button when cancel button is clicked..
            this.view.addCancelButtonClickHandler(this.onSearchFieldCancel, this);
            // React to "keyup" event generated when user types in the search term.
            this.view.addSearchFieldHandler('input', this.onSearchFieldInput, this);
        },

        /**
         * Get focusable element
         *
         * @return{Element} searchField
         */
        getFocusableElement: function () {
            return this.view.getSearchField();
        },

        /**
         * Search field input handler
         */
        onSearchFieldInput: function () {
            this.validateQuery();
            var searchTerm = this.view.getSearchFieldValue();
            this.hideShowCancelButton(searchTerm);
        },

        /**
         * Performs query validation
         */
        validateQuery: function () {
            var searchTerm = this.view.getSearchFieldValue();

            if (searchTerm.trim().length > 0) {
                this.trigger('validQuery');
            }
            else {
                this.trigger('invalidQuery');
            }
        },

        /**
         * Search field cancel handler
         */
        onSearchFieldCancel: function () {
            this.hideShowCancelButton('');
            this.view.setSearchFieldValue('');
            this.trigger('invalidQuery');
            this.view.focusSearchField();
        },

        /**
         * Toggle visibility of the cancel button if there is or isn't content present in the search.
         *
         * @param {String} text
         */
        hideShowCancelButton: function (text) {
            if (text.length > 0) {
                this.view.showCancelButton();
            } else {
                this.view.hideCancelButton();
            }
        },

        /**
         * Set search field value
         *
         * @param {String} value
         */
        setValue: function (value) {
            this.view.setSearchFieldValue(value);
            this.validateQuery();
            this.hideShowCancelButton(value);
        },

        /**
         * Get search field value
         *
         * @return{String} searchTerm
         */
        getValue: function () {
            return this.view.getSearchFieldValue().trim();
        },

        /**
         * Clear search field
         */
        clearSearchField: function () {
            this.view.setSearchFieldValue('');
            this.hideShowCancelButton('');
            this.trigger('invalidQuery');
        }

    });

});