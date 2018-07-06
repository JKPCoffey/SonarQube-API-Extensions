define([
    'jscore/core',
    'template!./chooseCollection.html',
    'styles!./chooseCollection.less',
    'i18n!networkexplorerlib/choosecollection.json'
], function (core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function () {
            return styles;
        },

        getRadioNewCollection: function() {
            return this.getElement().find('.elNetworkExplorerLib-wChooseCollection-newButton-radioNewCollection');
        },

        isRadioNewCollectionSelected: function() {
            return this.getRadioNewCollection().getProperty('checked');
        },

        getRadioExistingCollection: function() {
            return this.getElement().find('.elNetworkExplorerLib-wChooseCollection-existingButton-radioExistingCollection');
        },

        isRadioExistingCollectionSelected: function() {
            return this.getRadioExistingCollection().getProperty('checked');
        },

        getReplaceCheckbox: function() {
            return this.getElement().find('.elNetworkExplorerLib-wChooseCollection-replaceButton-replaceCheckbox');
        },

        isReplaceCheckboxSelected: function() {
            return this.getReplaceCheckbox().getProperty('checked');
        },

        isReplaceCheckboxDisabled: function() {
            return this.replaceCheckbox.getProperty('disabled');
        }
    });
});
