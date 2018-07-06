define([
    'jscore/core',
    'jscore/ext/net',
    './SimpleSearchView',
    'widgets/InfoPopup',
    '../../widgets/simplesearchinput/SimpleSearchInput'
], function (core, net, View, InfoPopup, SimpleSearchInput) {

    return core.Region.extend({
        View: View,

        /**
         * Lifecycle Method
         */
        onStart: function () {
            this.currentSearch = null;
            this.searchInput = new SimpleSearchInput();
            this.searchInput.addEventHandler('invalidQuery', this.onInvalidQuery, this);
            this.searchInput.addEventHandler('validQuery', this.onValidQuery, this);
            this.searchInput.attachTo(this.view.getSearchInput());
            this.view.addSearchFormHandler('submit', this.handleSearch, this);
        },

        onInvalidQuery: function () {
            this.view.disableSearchButton();
        },

        onValidQuery: function () {
            if (this.searchInput.getValue() !== '') {
                this.view.enableSearchButton();
            }
        },

        // Publish a search event on the eventBus with search details for other Regions to subscribe to.
        handleSearch: function () {
            this.currentSearch = this.searchInput.getValue();
            this.getEventBus().publish('simplesearch:search', encodeURIComponent(this.currentSearch));
        },

        clearSearchField: function () {
            this.searchInput.clearSearchField();
        }
    });
});