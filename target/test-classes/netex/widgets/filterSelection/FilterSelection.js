define([
    'jscore/core',
    './FilterSelectionView'
], function(core, View) {

    return core.Widget.extend({

        View: View,

        /*
         * Object lifecycle method
         */
        init: function() {
            this.filter = {
                byPrivateCategory: false,
                byPublicCategory: false,
                byFavorites: false,
                byNameValue: ''
            };
        },

        /*
         * Widget lifecycle method
         */
        onViewReady: function () {
            this.view.selectAllInputRadioButtonEl();
            this.view.deselectFavouritesRadioButtonEl();
            this.view.getCategory().addEventHandler('change', this.changeFilterSelected, this);
            this.view.getFavouritesRadioButtonEl().addEventHandler('change', this.changeFilterSelected, this);
            this.view.getFilterByNameEl().addEventHandler('input', this.changeFilterSelected, this);
        },


        /**
         * Method called when a filteris changed.
         *
         * @private
         * @method changeFilterSelected
         */
        changeFilterSelected: function() {
            this.trigger("FilterSelection::change");
        },


        /**
         * Methot that restores the initial state of filter
         *
         * @method clear
         */
        clear: function() {
            this.view.setEmptyFilterByNameValue();
            this.view.deselectFavouritesRadioButtonEl();
            this.view.selectAllInputRadioButtonEl();
            this.changeFilterSelected();
        },


        /**
         * Apply ByName filtering on input data.
         *
         * @private
         * @method applyByNameFilter
         * @param {Array<Object>} data
         * @param {String} filterText
         * @return {Array<Object>} filteredData
         */
        applyByNameFilter: function(data, filterText ) {
            var filteredData = [];
            if (filterText === '') {
                return data;
            } else {
                for (var index = 0; index < data.length; index++) {
                    // case independent match
                    if (data[index].name.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
                        filteredData.push(data[index]);
                    }
                }
            }
            return filteredData;
        },


        /**
         * Applies only specified sharing categories filtering on input data.
         *
         * @private
         * @method applyBySharingCategoryFilter
         * @param {String} category 'public' or 'private'
         * @param {Array<Object>} data
         * @return {Array<Object>} filteredData
         */
        applyBySharingCategoryFilter: function(category, data) {
            var filteredData = [];
            var match = category.toUpperCase();
            for (var index = 0; index < data.length; index++) {
                if (data[index].sharing.toUpperCase() === match) {
                    filteredData.push(data[index]);
                }
            }
            return filteredData;
        },


        /**
         * Apply Favorites filtering on input data.
         *
         * Uses:
         * - this.table
         *
         * @private
         * @method applyByFavoritesFilter
         * @param {Array<Object>} data
         * @return {Array<Object>} filteredData
         */
        applyByFavoritesFilter: function(data) {
            var filteredData = [];
            for (var index = 0; index < data.length; index++) {
                if (data[index].favourites === true) {
                    filteredData.push(data[index]);
                }
            }
            return filteredData;
        },


        /**
         * Apply all active filters to data passed with parameters.
         *
         * Uses:
         *
         * @method applyFilters
         * @param {Array<Object>} dataSource
         * @return {Array<Object>} subset of dataSource
         */
        applyFilters: function( dataSource ) {
            if( this.view.isPrivateButtonSelected() ) {
                dataSource = this.applyBySharingCategoryFilter('private', dataSource);
            }
            else if( this.view.isPublicButtonSelected() ) {
                dataSource = this.applyBySharingCategoryFilter('public', dataSource);
            }

            if( this.view.isFavouritesButtonSelected() ) {
                dataSource = this.applyByFavoritesFilter(dataSource);
            }

            return this.applyByNameFilter(dataSource, this.view.getFilterByNameValue());
        }
    });
});