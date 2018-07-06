define([
    "jscore/core",
    "template!./Results.html",
    "styles!./Results.less",
    'i18n!networkexplorerlib/Results.json',
], function(core, template, style, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function() {
            return style;
        },

        getResults: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults');
        },

        getInfoMessage: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-infoMessage');
        },

        showInfoMessage: function () {
            return this.getInfoMessage().removeModifier('hidden');
        },

        hideInfoMessage: function () {
            return this.getInfoMessage().setModifier('hidden');
        },

        getErrorMessage: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-errorMessage');
        },

        showErrorMessage: function () {
            return this.getErrorMessage().removeModifier('hidden');
        },

        hideErrorMessage: function () {
            return this.getErrorMessage().setModifier('hidden');
        },

        getNoResultsMessage: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-noResultsMessage');
        },

        showNoResultsMessage: function () {
            return this.getNoResultsMessage().removeModifier('hidden');
        },

        hideNoResultsMessage: function () {
            return this.getNoResultsMessage().setModifier('hidden');
        },

        getNoResultsParagraph: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-noResultsParagraph');
        },

        getNoResultsErrorMessageHeader: function () {
            return this.getNoResultsMessage().find('.elNetworkExplorerLib-rResults-messageHeader');
        },

        getErrorMessageHeader: function () {
            return this.getErrorMessage().find('.elNetworkExplorerLib-rResults-messageHeader');
        },

        getErrorMessageParagraph: function () {
            return this.getErrorMessage().find('.elNetworkExplorerLib-rResults-messageParagraph');
        },

        getSystemLogsLink: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-systemLogsLink');
        },

        setSystemLogsLinkTarget: function (url) {
            return this.getSystemLogsLink().setAttribute('href', url);
        },

        showSystemLogsLink: function () {
            return this.getSystemLogsLink().removeModifier('hidden');
        },

        hideSystemLogsLink: function () {
            return this.getSystemLogsLink().setModifier('hidden');
        },

        getActionPanel: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel');
        },

        getColumnSortHolder: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-right-columnSortHolder');
        },

        getSettingsButton: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-right-settings');
        },

        getTableHolder: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-tableHolder');
        },

        getCollectionSizeWarning : function() {
            return this.getElement().find('.elNetworkExplorerLib-rResults-collectionSizeWarning');
        },

        showCollectionSizeWarning: function () {
            this.getCollectionSizeWarning().removeModifier('hidden');
        },

        hideCollectionSizeWarning: function () {
            this.getCollectionSizeWarning().setModifier('hidden');
        },

        showTable: function () {
            this.getTableHolder().removeModifier('hidden');
        },

        hideTable: function () {
            this.getTableHolder().setModifier('hidden');
        },

        disableTableRegion: function () {
            this.getTableHolder().setModifier('disabled');
        },

        enableTableRegion: function () {
            this.getTableHolder().removeModifier('disabled');
        },

        getSortLoader: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-sortLoading');
        },

        showSortLoader: function () {
            this.getSortLoader().removeModifier('hidden');
        },

        hideSortLoader: function () {
            this.getSortLoader().setModifier('hidden');
        },

        showActionPanel: function () {
            this.getActionPanel().removeModifier('hidden');
        },

        hideActionPanel: function () {
            this.getActionPanel().setModifier('hidden');
        },

        getLoadingAnimation: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-loadingAnimation');
        },

        showLoadingAnimation: function () {
            this.getLoadingAnimation().removeModifier('hidden');
        },

        hideLoadingAnimation: function () {
            this.getLoadingAnimation().setModifier('hidden');
        },

        getNumberOfResults: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left-resultCount');
        },

        getSelectedObjectCount: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left-selectedObjectCount');
        },

        getClearSelection: function() {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left-clearSelection');
        },

        showClearSelectionLink: function() {
            this.getClearSelection().removeModifier('hidden');
        },

        hideClearSelectionLink: function() {
            this.getClearSelection().setModifier('hidden');
        },

        getClearSelectionLink: function() {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left-clearSelection-link');
        },

        getResultsWarning: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left-resultsWarning');
        },

        getActionPanelLeft: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-left');
        },

        showResultsSizeWarning: function () {
            this.getActionPanelLeft().setModifier('warning');
        },

        hideResultsSizeWarning: function () {
            this.getActionPanelLeft().removeModifier('warning');
        },

        getHeaderCheckbox: function() {
            return this.getElement().find('.elTablelib-CheckboxHeaderCell-wrap .ebCheckbox-inputStatus');
        },

        setHeaderCheckboxInputStatusTriple: function() {
            this.getHeaderCheckbox().setModifier('triple');
        },

        removeHeaderCheckboxInputStatusTriple: function() {
            this.getHeaderCheckbox().removeModifier('triple');
        },

        setNumberOfResultsText: function (text) {
            this.getNumberOfResults().setText(text);
        },

        setSelectedObjectCountText: function(text) {
            this.getSelectedObjectCount().setText(text);
        },

        setNoResultsParagraphContent: function (el) {
            this.getNoResultsParagraph().setText('');
            this.getNoResultsParagraph().append(el);
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

        setNoResultsErrorMessageHeaderText: function (text) {
            this.getNoResultsErrorMessageHeader().setText(text);
        },

        getTableHeaderByTitle: function (title) {
            return this.getElement().find('.elTablelib-Table th[title="'+ title +'"]');
        },

        /**
         * Puts a marker on a column header that indicates it should be highlighted when highlighting is enabled
         * @param title
         */
        addTableHeaderHighlightMarker: function (title) {
            if(this.getTableHeaderByTitle(title)){
                this.getTableHeaderByTitle(title).setModifier("contains-distinct", "", "elNetworkExplorerLib_tableHeader");
            }
        },

        removeTableHeaderHighlightMarker: function (title) {
            if(this.getTableHeaderByTitle(title)){
                this.getTableHeaderByTitle(title).removeModifier("contains-distinct", "elNetworkExplorerLib_tableHeader");
            }
        },

        showRightPanel: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-right').removeModifier('hidden');
        },

        hideRightPanel: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-right').setModifier('hidden');
        },

        getInfoIconHolder: function () {
            return this.getElement().find('.elNetworkExplorerLib-rResults-actionPanel-right-infoIconHolder');
        },

        getColumnHighlightingCheckbox: function () {
            return this.getElement().find('.col-highlighting-checkbox');
        },

        isColumnHighlightingCheckboxSelected: function () {
            return this.getColumnHighlightingCheckbox().getProperty('checked');
        },

        addCheckboxChangeEventHandler: function (callback, context) {
            this.getColumnHighlightingCheckbox().addEventHandler('change', function (e) {
                e.preventDefault();
                if (context) {
                    callback.call(context);
                } else {
                    callback();
                }
            });
        },

        enableColumnHighlighting: function () {
            this.getTableHolder().setModifier('highlight-cols');
        },

        disableColumnHighlighting: function () {
            this.getTableHolder().removeModifier('highlight-cols');
        }
    });

});