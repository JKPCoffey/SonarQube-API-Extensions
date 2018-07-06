define([
    "jscore/core",
    "template!./collectionFromFileResultDetails.html",
    "styles!./collectionFromFileResultDetails.less",
    'i18n!networkexplorerlib/collectionfromfileresultdetails.json',
], function(core, template, style, strings) {

    return core.View.extend({

        init: function (options) {
            this.total = options.total;
            this.added = options.added;
            this.failed = options.failed;
        },

        getTemplate: function() {
            return template({
                strings: strings,
                total: this.total,
                added: this.added,
                failed: this.failed
            });
        },

        getStyle: function() {
            return style;
        },

        getExportButton: function () {
            return this.getElement().find('.elNetworkExplorerLib-wCollectionFromFileResultDetails-exportButton');
        },

        getTableHolder: function () {
            return this.getElement().find('.elNetworkExplorerLib-wCollectionFromFileResultDetails-tableHolder');
        },

        getExportRef: function () {
            return this.getElement().find('.elNetworkExplorerLib-wCollectionFromFileResultDetails-export');
        }
    });
});