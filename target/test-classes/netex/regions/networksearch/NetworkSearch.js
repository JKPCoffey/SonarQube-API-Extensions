define([
    'jscore/core',
    'jscore/ext/mvp',
    './NetworkSearchView',
    '../simplesearch/SimpleSearch',
    'networkexplorerlib/regions/Results',
    '../results/columnsUtil'
], function (core, mvp, View, SimpleSearch, Results, columnsUtil) {

    /**
     * Shared Region
     *
     * @class NetworkSearch
     */
    return core.Region.extend({

        View: View,

        /**
         * Lifecycle Method
         */
        onStart: function () {
            this.currentSelection = [];

            var tableColumns = columnsUtil.getDefaultColumns().filter(function(column) {
                return ['moName', 'moType', 'cmSyncStatus'].indexOf(column.attribute) > -1;
            });

            var containerElement = this.getElement().getParent();

            this.Search = new SimpleSearch({context: this.getContext()});
            this.Search.start(this.view.getContentPlaceholder());
            this.Results = new Results({
                context: this.getContext(),
                tableColumns: tableColumns,
                multipleSelection: this.options.multipleSelection,
                isScopingPanel: true,
                setHeightCallback: function() {
                    requestAnimationFrame(function() {
                        var elementTop = 0;
                        var containerHeight = parseInt(containerElement.getStyle('height'));

                        var iterElement = this.getElement().getNative();
                        while (iterElement && containerElement.getNative().contains(iterElement)) {
                            elementTop += (iterElement.offsetTop - iterElement.scrollTop + iterElement.clientTop);
                            iterElement = iterElement.offsetParent;
                        }

                        var height = (containerHeight - elementTop) + 'px';

                        this.getElement().setStyle({height: height});
                        this.table.redraw();
                    }.bind(this));
                }
            });
            this.Results.start(this.view.getContentPlaceholder());

            this.getEventBus().subscribe('resultstable:selectionchanged', this.onSelectionChanged, this);

            this.getEventBus().subscribe('simplesearch:search', this.onSearch, this);
        },

        /**
         * Notifies the change in selection.
         *
         * @private
         * @method notifySelectionChange
         * @param {Object} selectionObject
         */
        notifySelectionChange: function(objects) {
            this.getEventBus().publish('networksearch:selected', objects);
        },

        /**
         * update the changes made by selection.
         *
         * @private
         * @method onSelectionChanged
         * @param {Object} selectionObject
         */
        onSelectionChanged: function(selectionObject) {
            this.currentSelection = selectionObject.data;
            this.notifySelectionChange(this.currentSelection);
        },

        /**
         * Load the results and clears the previous selections.
         *
         * @private
         * @method onSearch
         */
        onSearch: function() {
            if (this.currentSelection.length > 0) {
                this.currentSelection = [];
                this.notifySelectionChange(this.currentSelection);
            }
            this.Results.loadSearch.apply(this.Results, arguments);
        }
    });
});

