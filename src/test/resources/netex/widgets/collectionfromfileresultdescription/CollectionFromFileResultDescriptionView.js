define([
    "jscore/core",
    "template!./collectionFromFileResultDescription.html",
    "styles!./collectionFromFileResultDescription.less"
], function(core, template, style) {

    return core.View.extend({

        getTemplate: function() {
            return template();
        },

        getStyle: function() {
            return style;
        },

        getMessage: function() {
            return this.getElement().find('.elNetworkExplorerLib-wCollectionFromFileResultDescription-message');
        }
    });
});