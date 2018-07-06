define([
    'jscore/core',
    'template!./SimpleSearchInput.html',
    'styles!./SimpleSearchInput.less',
    'i18n!networkexplorerlib/SearchInput.json'
], function (core, template, styles, strings) {

    return core.View.extend({
        getTemplate: function () {
            return template({
                strings: strings
            });
        },

        getStyle: function () {
            return styles;
        },

        getSearchField: function() {
            return this.getElement().find('.elNetworkExplorerLib-wSimpleSearchInput-searchInput');
        },

        getSearchFieldValue: function() {
            return this.getSearchField().getValue();
        },

        setSearchFieldValue: function(value) {
            this.getSearchField().setValue(value);
        },

        focusSearchField: function () {
            this.getSearchField().focus();
        },

        setFocusStyleSearchField: function() {
            return this.getSearchField().setModifier('focused', 'true');
        },

        addSearchFieldHandler: function(eventName, callback, context){
            this.getSearchField().addEventHandler(eventName, function(){
                callback.call(context);
            });
        },

        getCancelButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-wSimpleSearchInput-searchCancel');
        },

        showCancelButton: function() {
            return this.getCancelButton().setModifier('visible');
        },

        hideCancelButton: function() {
            return this.getCancelButton().removeModifier('visible');
        },

        addCancelButtonClickHandler: function(callback, context){
            this.getCancelButton().addEventHandler('click', function(){
                callback.call(context);
            });
        }
    });

});