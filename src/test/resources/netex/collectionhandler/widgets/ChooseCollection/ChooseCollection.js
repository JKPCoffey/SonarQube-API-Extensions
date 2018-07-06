define([
    "jscore/core",
    'jscore/ext/net',
    './ChooseCollectionView'
], function(core, net, View) {

    return core.Widget.extend({

        View: View,

        /*
         * Lifecycle method
         */
        onViewReady: function () {
            this.trigger('ChooseCollection:newCollection');
            this.view.getRadioNewCollection().addEventHandler('click', this.handleNewCollection, this);
            this.view.getRadioExistingCollection().addEventHandler('click', this.handleExistingCollection, this);
            this.view.getReplaceCheckbox().addEventHandler('click', this.handleReplaceObjects, this);
        },

        /**
         * Callback function when selecting new collection radio button.
         *
         * @method handleNewCollection
         */
        handleNewCollection: function () {
            this.view.getReplaceCheckbox().setProperty('disabled', true);
            this.trigger('ChooseCollection:newCollection');
        },

        /**
         * Callback function when selecting existing collection radio button.
         *
         * @method handleExistingCollection
         */
        handleExistingCollection: function () {
            this.view.getReplaceCheckbox().setProperty('disabled', false);
            this.trigger('ChooseCollection:existingCollection');
        },

        /**
         * Callback function when checking replace option checkbox for existing collection.
         *
         * @method handleReplaceObjects
         */
        handleReplaceObjects: function() {
            this.trigger('ChooseCollection:replaceObjects', this.view.isReplaceCheckboxSelected());
        }
    });
});
