define([
    'jscore/core',
    'template!./insertCollection.html',
    'styles!./insertCollection.less',
    'i18n!networkexplorerlib/insertcollection.json'
], function (core, template, styles, strings) {

    var ERROR = "error";

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function () {
            return styles;
        },

        getCollectionNameInput: function() {
            return this.getElement().find('.elNetworkExplorerLib-wInsertCollection-collectionNameInput');
        },

        getCollectionNameValue: function() {
            return this.getCollectionNameInput().getProperty('value').trim();
        },

        isCollectionNameValid: function() {
            // to show the 'required' error when user empty the field
            // after the initial visualization
            this.getCollectionNameInput().setAttribute("required");

            return this.getCollectionNameInput().getNative().checkValidity();
        },

        removeCustomValidity: function() {
            this.getCollectionNameInput().getNative().setCustomValidity('');
        },

        setCustomValidity: function(message) {
            this.getCollectionNameInput().getNative().setCustomValidity(message);
        },

        getValidityStatus: function() {
            return this.getCollectionNameInput().getProperty('validity');
        },

        getInputStatusError: function() {
            return this.getElement().find('.ebInput-statusError');
        },

        setInputStatusErrorText: function(text) {
            return this.getInputStatusError().setText(text);
        },

        getRadioPrivate: function() {
            return this.getElement().find('.elNetworkExplorerLib-wInsertCollection-radioPrivate');
        },

        isRadioPrivateChecked: function() {
            return this.getRadioPrivate().getProperty('checked');
        }
    });
});
