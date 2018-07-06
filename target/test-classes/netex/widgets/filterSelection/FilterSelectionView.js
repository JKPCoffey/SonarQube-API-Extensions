define([
    'jscore/core',
    'template!./filterSelection.html',
    'styles!./filterSelection.less',
    'i18n!networkexplorerlib/filterSelection.json'
], function(core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function() {
            return styles;
        },

        getFilterByNameEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-filterByName');
        },

        getFilterByNameValue: function() {
            return this.getFilterByNameEl().getProperty('value').trim();
        },

        setEmptyFilterByNameValue: function() {
            this.getFilterByNameEl().setValue('');
        },

        getAllButtonEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-sharingButtonsGroup-all');
        },

        getAllInputRadioButtonEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-sharingButtonsGroup-all-radio');
        },

        selectAllInputRadioButtonEl: function() {
            this.getAllInputRadioButtonEl().setProperty('checked', true);
        },

        getPublicButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-public');
        },

        isPublicButtonSelected: function() {
            return this.getPublicButton().getProperty('checked');
        },

        getPrivateButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-private');
        },

        isPrivateButtonSelected: function() {
            return this.getPrivateButton().getProperty('checked');
        },

        getFavouritesButtonEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-favouritesButtonsGroup-favourites');
        },

        getFavouritesRadioButtonEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-favouritesButtonsGroup-favourites-radio');
        },

        deselectFavouritesRadioButtonEl: function() {
            this.getFavouritesRadioButtonEl().setProperty('checked', false);
        },

        isFavouritesButtonSelected: function() {
            return this.getFavouritesRadioButtonEl().getProperty('checked');
        },

        getCategory: function() {
            return this.getElement().find('.elNetworkExplorerLib-FilterSelection-filters-sharingButtonsGroup');
        }
    });
});