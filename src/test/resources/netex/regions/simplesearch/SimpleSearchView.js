define([
    "jscore/core",
    "template!./SimpleSearch.html",
    "styles!./SimpleSearch.less",
], function(core, template, style) {

    return core.View.extend({

        getTemplate: function() {
            return template();
        },

        getStyle: function() {
            return style;
        },

        getSearchForm: function () {
            return this.getElement().find('.elNetworkExplorerLib-rSimpleSearch-form');
        },

        addSearchFormHandler: function(eventName, callback, context){
            this.getSearchForm().addEventHandler(eventName, function(e){
                e.preventDefault();
                callback.call(context);
            });
        },

        getSearchInput: function () {
            return this.getElement().find('.elNetworkExplorerLib-rSimpleSearch-form-searchInput');
        },

        getSearchButton: function() {
            return this.getElement().find('.elNetworkExplorerLib-rSimpleSearch-form-searchBtn');
        },

        disableSearchButton: function(){
            this.getSearchButton().setProperty('disabled', true);
        },

        enableSearchButton: function(){
            this.getSearchButton().setProperty('disabled', false);
        }
    });

});