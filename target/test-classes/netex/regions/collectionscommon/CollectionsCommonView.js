define([
    'jscore/core',
    'template!./collectionsCommon.html',
    'styles!./collectionsCommon.less',
    'i18n!networkexplorerlib/collectionscommon.json'
], function(core, template, styles, strings) {

    return core.View.extend({

        init: function (options) {
            this.stringsImpl = options.stringsImpl;
        },

        getTemplate: function() {
            return template({
                strings: strings,
                stringsImpl: this.stringsImpl
            });
        },

        getStyle: function() {
            return styles;
        },

        getTitleAndFiltersEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-titleAndFilters');
        },

        showTitleAndFilters: function( compactMode ) {
            if( compactMode ) {
                this.getFilterSelection().setStyle({ 'float': 'left' });
                this.getTable().setModifier("tableCollections");
            }
            this.getTitleAndFiltersEl().removeModifier('hidden');
        },

        hideTitleAndFilters: function() {
            this.getTitleAndFiltersEl().setModifier('hidden');
        },

        getTable: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-content');
        },

        hideTable: function() {
            this.getTable().setModifier('hidden');
        },

        showTable: function() {
            this.getTable().removeModifier('hidden');
        },

        getCollectionCountEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-titleAndFilters-title-collections-count');
        },

        setNumberOfCollections: function(text) {
            this.getCollectionCountEl().setText(text);
        },

        getSelectedCountEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-titleAndFilters-title-selected-count');
        },

        setNumberOfSelected: function(text) {
            this.getSelectedCountEl().setText(text);
        },

        getSelectedEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-titleAndFilters-title-selected');
        },

        hideSelected: function() {
            this.getSelectedEl().setModifier('hidden');
        },

        showSelected: function() {
            this.getSelectedEl().removeModifier('hidden');
        },

        getLoaderEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-loader');
        },

        showLoader: function() {
            this.getLoaderEl().removeModifier('hidden');
        },

        hideLoader: function() {
            this.getLoaderEl().setModifier('hidden');
        },

        getErrorMessage: function () {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-errorMessage');
        },

        showErrorMessage: function () {
            return this.getErrorMessage().removeModifier('hidden');
        },

        hideErrorMessage: function () {
            return this.getErrorMessage().setModifier('hidden');
        },


        getErrorMessageHeader: function () {
            return this.getErrorMessage().find('.elNetworkExplorerLib-rCollectionsCommon-messageHeader');
        },

        getErrorMessageParagraph: function () {
            return this.getErrorMessage().find('.elNetworkExplorerLib-rCollectionsCommon-messageParagraph');
        },

        setErrorMessageHeaderText: function (text) {
            this.getErrorMessageHeader().setText(text);
        },

        setErrorMessageParagraphText: function (text) {
            this.getErrorMessageParagraph().setText(text);
        },

        setErrorMessageParagraphAndListText: function (el) {
            this.getErrorMessageParagraph().setText('');
            this.getErrorMessageParagraph().append(el);
        },

        getInfoMessageEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-infoMessage');
        },

        hideInfoMessage: function() {
            this.getInfoMessageEl().setModifier('hidden');
        },

        showInfoMessage: function() {
            this.getInfoMessageEl().removeModifier('hidden');
        },

        getInfoMessageHeaderEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-infoMessageHeader');
        },

        setInfoMessageHeader: function(text) {
            this.getInfoMessageHeaderEl().setText(text);
        },

        getInfoMessageParagraphEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-infoMessageParagraph');
        },

        setInfoMessageParagraph: function(text) {
            this.getInfoMessageParagraphEl().setText(text);
        },

        getToastEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-toast');
        },

        showToast: function() {
            this.getToastEl().removeModifier('hidden');
        },

        hideToast: function() {
            this.getToastEl().setModifier('hidden');
        },

        getContentEl: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-content');
        },

        getOffsetHeight: function() {
            return this.getElement().getNative().offsetHeight;
        },

        getTableHeight: function() {
            var tableHeight = this.getOffsetHeight() - 19;
            tableHeight -= this.isVisibleHorizontalTableScrollbar() ? 10 : 0;
            return (Math.floor((tableHeight)/32))*32;
        },

        hideTableHorizontalScrollbar: function() {
            this.getElement().find('.elTablelib-Table-wrapper.eb_scrollbar').setStyle({ 'overflow-x': 'hidden' });
        },

        setContentElHeight: function(newHeight) {
            this.getContentEl().setStyle('height', newHeight - 17 );
        },

        getFilterSelection: function() {
            return this.getElement().find('.elNetworkExplorerLib-rCollectionsCommon-titleAndFilters-filters');
        },

        isVisibleHorizontalTableScrollbar: function() {
            var tableScollbarElement = this.getElement().find('.elTablelib-Table-wrapper');
            if( tableScollbarElement !== undefined ) {
                return tableScollbarElement.getNative().clientWidth < tableScollbarElement.getNative().scrollWidth;
            }
            return false;
        }
    });
});