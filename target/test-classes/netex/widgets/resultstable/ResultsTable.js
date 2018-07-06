define([
    'jscore/core',
    'container/api',
    'widgets/Dialog',
    '../loader/Loader',
    'tablelib/Table',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/VirtualScrolling',
    '../../classes/VirtualScrollingData',
    '../../classes/SelectionObject',
    '../../classes/Cache',
    './ResultsTableView'
], function (
    core,
    Container,
    Dialog,
    Loader,
    Table,
    ResizableHeader,
    RowEvents,
    SortableHeader,
    VirtualSelection,
    VirtualScrolling,
    VirtualScrollingData,
    SelectionObject,
    Cache,
    View
) {

    return core.Widget.extend({

        View: View,

        // Lifecycle

        /**
         * @constructor
         * @param options
         */
        init: function (options) {
            // Store options
            this.virtualScrollingData = options.virtualScrollingData;
            this.selectionObject = options.selectionObject;
            this.setHeightCallback = options.setHeightCallback;
            this.columns = options.columns;
            this.sortOptions = options.sort;
            this.context = options.context;
            this.multipleSelection = typeof options.multipleSelection === 'undefined' ? true : !!options.multipleSelection;
            this.cache = options.cache;
            this.isScopingPanel = options.isScopingPanel;

            this.counters = {
                getData: 0
            };
            this.rightClickCallbacks = [];

            this.initTable();
        },

        /**
         * Creates the Table widget using the objects supplied during the init phase
         *
         * @method initTable
         */
        initTable: function () {
            // Create a new widget with new handlers
            this.table = new Table({
                plugins: [
                    new ResizableHeader(),
                    new SortableHeader(),
                    new VirtualScrolling({
                        totalRows: this.virtualScrollingData.getIdCount(),
                        getData: this.getData.bind(this),
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new VirtualSelection({
                        bind: this.multipleSelection,
                        checkboxes: this.multipleSelection,
                        multiselect: this.multipleSelection,
                        preserveOrder: true,
                        selectableRows: true,
                        idAttribute: 'poId',
                        getIds: this.virtualScrollingData.getIds.bind(this.virtualScrollingData),
                        getAllIds: this.virtualScrollingData.getAllIds.bind(this.virtualScrollingData)
                    }),
                    new RowEvents({
                        events: ['contextmenu']
                    })
                ],
                columns: this.columns,
                tooltips: true
            });
            this.table.addEventHandler('check',this.onCheck, this);
            this.table.addEventHandler('idselectend', this.onIdSelectEnd, this);
            this.table.addEventHandler('sort', this.onSortChanged, this);
            this.table.addEventHandler('rowevents:contextmenu', this.onRightClick, this);
            // Update sort ui elements
            this.sort(this.sortOptions);
            // Prepare for action events
            this.context.eventBus.subscribe('resultstable:contextactions', this.showContextMenu, this);
        },

        // Public Interface

        /**
         * Perform a sort on the data
         *
         * @method sort
         * @param {Object} sort (direction,attribute)
         */
        sort:function(sortOptions) {
            if (sortOptions) {
                this.table.setSortIcon(sortOptions.direction, sortOptions.attribute);
            } else {
                this.table.disableSort();
            }
        },

        /**
         * Recreates the table's previous state but with new columns.
         *
         * @method updateColumns
         * @param {Array} columns Array of column definitions as per Tablelib API
         */
        updateColumns:function(columns) {
            var previouslySelectedIds = this.table.getSelectedIds();
            this.table.destroy();
            this.columns = columns;
            this.initTable();
            this.onViewReady();
            if(previouslySelectedIds.length > 0) {
                this.table.addSelectedIds(previouslySelectedIds);
            }
        },

        // Callbacks

        /**
         * When any error from getPosByPoids occurs, come here
         *
         * @method onVirtualScrollingDataError
         * @param msg
         * @param xhr
         */
        onVirtualScrollingDataError: function (msg, xhr) {
            this.virtualScrollingData.errorCallback(xhr);
        },

        /**
         * VirtualScrolling callback
         * We catch it for a few reasons:
         * * so we can control the rate of getData calls
         * * so we can discard stale getData calls
         * * so we can have table actions
         *
         * @method getData
         * @param start
         * @param length
         * @param success
         */
        getData: function (start, length, success) {
            // If a previous getData is in progress, cancel it
            clearTimeout(this.getDataTimeoutId);
            // If data is cached then update the view ASAP else give the user a chance to finish scrolling
            var end = start + length,
                idList = this.virtualScrollingData.getIdsFromIndexes(start, end),
                waitDuration = this.cache.isDataAvailable(idList) ? 0 : 750;
            // Show the user the range that is about to load
            this.table.getVirtualScrollBar().setAnnotationText((start + 1) + ' - ' + (end));
            this.getDataTimeoutId = setTimeout(function () {
                ++this.counters.getData;
                this.virtualScrollingData.loadData(start, length)
                    .then(function (response) {
                        this.context.eventBus.publish('resultstable:resultschanged', {
                                deletedIds:(response.deletedIds || [])
                        });

                        // Flatten attributes if present
                        var virtualScrollingData = response.data.map(function (object) {
                            if (object.attributes) {
                                Object.keys(object.attributes).forEach(function (attribute) {
                                    object[attribute] = object.attributes[attribute];
                                });
                            }
                            return object;
                        });
                        // Before we render, publish data so any hooks can run
                        this.context.eventBus.publish('resultstable:beforerender', virtualScrollingData);
                        // Show data in table
                        success(virtualScrollingData);
                    }.bind(this))
                    .catch(this.onVirtualScrollingDataError);
            }.bind(this), waitDuration);
        },

        /**
         * Deselect all rows in the table.
         */
        clearSelectedRows: function() {
            this.table.unselectAllIds();
        },

        /**
         * Set total number of rows present in the table.
         *
         * @method setTotalRows
         * @param totalRows number of rows
         */
        setTotalRows: function(totalRows) {
            this.table.setTotalRows(totalRows);
        },

        // Table Event Handlers

        onRightClick: function (row, event) {
            var selectedId = row.getData().poId;
            // If the row is not selected then unselect all others
            if (this.selectionObject.getCount() > 0 && !this.selectionObject.contains(selectedId)) {
                this.table.unselectAllIds();
            }
            this.table.addSelectedIds(selectedId);
            if(this.isScopingPanel){
                return;
            }

            Container.getEventBus().publish('contextmenu:show', event, function () {
                // Defer until actions are available
                return new Promise(function (resolve) {
                    this.rightClickCallbacks.push(resolve);
                }.bind(this));
            }.bind(this));
        },

        onSortChanged: function(direction, attribute) {
            if (this.sortOptions.direction !== direction || this.sortOptions.attribute !== attribute) {
                this.context.eventBus.publish('resultstable:sortchanged', {
                    direction: direction,
                    attribute: attribute
                });
            }
        },

        onCheck: function (/*row, checked*/) {
            Container.getEventBus().publish('contextmenu:hide');
        },

        onIdSelectEnd: function(ids) {
            if (ids.length === 0) { // Deselection
                this.selectionObject.clear();
                this.notifySelectionChange();
                this.showContextualActionsFor(this.selectionObject.getObjects());
            } else { // Deselection
                this.selectionObject.clear();
                this.selectionObject.addIds(ids);
                this.notifySelectionChange();
                this.showContextualActionsFor(this.cache.get(ids));
            }
        },

        /**
         * Send message declaring SelectionObject has changed
         *
         * @method notifySelectionChange
         */
        notifySelectionChange: function() {
            this.context.eventBus.publish('resultstable:selectionchanged', this.selectionObject);
        },

        // Contextual Actions

        /**
         * Send message requesting actions for objects
         *
         * @method showContextualActionsFor
         * @param objects
         */
        showContextualActionsFor: function(objects) {
            // Toward Action Bar (external to ResultsTable)
            this.context.eventBus.publish('resultstable:showcontextualactions', objects);
        },

        /**
         * Show the Context Menu content if a menu is awaiting actions
         *
         * @method showContextMenu
         * @param actions
         */
        showContextMenu: function(actions) {
            if (this.rightClickCallbacks.length > 0) {
                var latest = this.rightClickCallbacks.pop();
                this.rightClickCallbacks = [];
                if (actions.length > 0) {
                    latest(actions);
                }  else {
                    Container.getEventBus().publish('contextmenu:hide');
                }
            }
        },

        // View handlers

        onViewReady: function () {
            this.table.attachTo(this.getElement());
            if (this.options.setHeightCallback) {
                this.setHeight = this.options.setHeightCallback;
            }
            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.setHeight.bind(this));
            // Set initial size
            this.setHeight();
        },

        onDOMAttach: function() {
            // Listen for a scroll event to hide context menu
            if (!this.hideContextMenuOnScrollEventHandlerId) {
                requestAnimationFrame(function () {
                    this.hideContextMenuOnScrollEventHandlerId = this.table.getVirtualScrollBar().addEventHandler('change', function () {
                        Container.getEventBus().publish('contextmenu:hide');
                    });
                }.bind(this));
            }
        },

        onDestroy: function () {
            this.table.destroy();
            this.virtualScrollingData.destroy();
            core.Window.removeEventHandler(this.windowResizeEvtId);
            core.Window.removeEventHandler(this.hideContextMenuOnScrollEventHandlerId);
        },

        /**
         * Special Callback function - can be overridden by providing a function
         * Default implementation is an example and should not be modified
         *
         * @method setHeight
         * @param resultsTableRef Reference to the ResultsTable controller object
         */
        setHeight: function () {
            clearTimeout(this.setHeightTimeoutId);
            this.setHeightTimeoutId = setTimeout(function() {
                var padding = 16;
                var element = this.getElement();
                var currentHeight = element.getStyle('height');
                var windowHeight = core.Window.getProperty('innerHeight');
                var elementTop = 0;
                var iterElement = element.getNative();

                while(iterElement) {
                    elementTop += (iterElement.offsetTop - iterElement.scrollTop + iterElement.clientTop);
                    iterElement = iterElement.offsetParent;
                }
                elementTop = elementTop || 400;

                var preliminaryTableHeight = (windowHeight - elementTop) - padding;
                var calculatedTableHeight = Math.max(400, preliminaryTableHeight );
                this.currentHeight = calculatedTableHeight + 'px';

                if(currentHeight !== this.currentHeight) {
                    if (element.getParent()) { // after onViewReady, before attachTo
                        element.getParent().setStyle({height: (calculatedTableHeight + padding) + 'px'});
                    }
                    element.setStyle({height: this.currentHeight});
                    this.table.redraw();
                }
            }.bind(this), 250);
        }
    });

});