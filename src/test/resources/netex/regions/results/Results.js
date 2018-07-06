define([
    './ResultsView',
    'i18n/number',
    'i18n!networkexplorerlib/Results.json',
    'template!./singleSearchInfoTemplate.html',
    'template!./requestTimeoutErrorTemplate.html',
    'jscore/core',
    'jscore/ext/mvp',
    'jscore/ext/net',
    'widgets/Dialog',
    'widgets/InfoPopup',
    'widgets/Notification',
    'widgets/InlineMessage',
    'widgets/Loader',
    'widgets/Tooltip',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/VirtualScrolling',
    'container/api',
    './columnsUtil',
    '../../widgets/settings/Settings',
    '../../widgets/resultstable/ResultsTable',
    '../../classes/VirtualScrollingData',
    '../../classes/SelectionObject',
    '../../classes/ResultsData',
    '../../classes/ActionManager_Interface',
    '../../classes/ErrorHandler',
    '../../classes/Cache'
], function ( //NOSONAR
    View,
    numberDelimiter,
    strings,
    singleSearchInfoTemplate,
    requestTimeoutErrorTemplate,
    core,
    mvp,
    net,
    Dialog,
    InfoPopup,
    Notification,
    InlineMessage,
    Loader,
    Tooltip,
    ResizableHeader,
    SortableHeader,
    VirtualSelection,
    VirtualScrolling,
    Container,
    columnsUtil,
    Settings,
    ResultsTable,
    VirtualScrollingData,
    SelectionObject,
    ResultsData,
    ActionManager_Interface,
    ErrorHandler,
    Cache
) {

    return core.Region.extend({
        View: View,

        REST_USERPROFILE: '/editprofile', //e.g. {"username":"administrator","firstName":"security","lastName":"admin","email":"security@administor.com","userType":"enmUser","status":"enabled","_id":"administrator","_rev":"11","isMemberOf":"SECURITY_ADMIN,ADMINISTRATOR","lastLogin":"20150901145848+0000"}
        REST_SYSTEMTIME: '/rest/system/time', //e.g. {"timestamp":1441121209041,"utcOffset":1.0,"timezone":"IST","serverLocation":"Eire"}
        REST_LOGVIEWER_TEMPLATE: ['#logviewer/1//(host:"netex" OR host:"presentation") AND message:"','" AND message:"','"/?searchFrom=','&searchTo='],
        ID: 'id',

        COLLECTION_HANDLER_FLYOUT_WIDTH: '420px',

        counters: {
            contextualAction: 0
        },

        init: function(options) {
            /**
             * showRightPanel: {Boolean}
             * * true enables the right panel (Column Highlighting, Settings)
             */
            options.showRightPanel = options.showRightPanel || false;

            /**
             * tableColumns: {Array} of Column Options
             * * Optional
             * * Default behavior is to use the columnsUtil helper class
             * * See tablelib/Table documentation for more info
             */
            this.tableColumns = options.tableColumns;

            /**
             * actionManager: {Function}
             * * Optional
             * * Default behavior is to provide a stub
             * * Constructor for the ActionManager class
             */
            this.ActionManager = options.actionManagerConstructor;

            /**
             * setHeightCallback: {Function}
             * * Optional
             * * Callback for the setHeight method, called once on ResultsTable widget creation
             */
            this.setHeightCallback = options.setHeightCallback;

            /**
             * isScopingPanel: {Boolean}
             * * True if the user is using the scoping panel in another application. False otherwise.
             * * Used in Results Data to add a custom request header.
             */
            this.isScopingPanel = options.isScopingPanel || false;
        },

        /**
         * Lifecycle method
         */
        onStart: function () {
            this.cache = new Cache(this.ID);
            this.resultsData = new ResultsData({
                id: this.ID,
                cache: this.cache,
                isScopingPanel: this.isScopingPanel
            });
            this.resultsData.addEventHandler('resultsdata:resultsSizeWarning', this.showResultsSizeWarning, this);
            this.resultsData.addEventHandler('resultsdata:resultsSizeOk', this.hideResultsSizeWarning, this);
            this.resultsData.addEventHandler('resultsdata:fetchStarted', this.fetchStarted, this);
            this.resultsData.addEventHandler('resultsdata:fetchError', this.fetchError, this);
            this.resultsData.addEventHandler('resultsdata:collectionFetchError', this.fetchSavedSearchCollectionsError, this);
            this.resultsData.addEventHandler('resultsdata:searchLoaded', this.searchLoaded, this);
            this.resultsData.addEventHandler('resultsdata:collectionLoaded', this.collectionLoaded, this);
            this.resultsData.addEventHandler('resultsdata:savedSearchLoaded', this.savedSearchLoaded, this);
            this.resultsData.addEventHandler('resultsdata:setSearchField', this.setSearchField, this);
            this.resultsData.addEventHandler('resultsdata:showInfo', this.showInfo, this);
            this.resultsData.addEventHandler('resultsdata:retrying', this.showRetryWarning, this);
            this.resultsData.addEventHandler('resultsdata:retryingComplete', this.hideRetryWarning, this);
            this.resultsData.addEventHandler('resultsdata:servicesAreOffline', this.showServicesOfflineDialog, this);
            this.resultsData.addEventHandler('resultsdata:abortFetch', this.cancelVirtualScrollingDataFetch, this);

            this.errorHandler = new ErrorHandler();

            this.userWarningNotification = undefined;
            this.resultsTable = undefined;
            this.selectionObject = undefined;

            this.currentSort = {};

            var settingsButton = this.view.getSettingsButton();
            settingsButton.addEventHandler('click', this.showTableSettings, this);
            new Tooltip({ // NOSONAR uses parent to set self
                parent: settingsButton,
                contentText: strings.get('settings')
            });

            this.resultsSizeWarningPopup = new InfoPopup({
                icon: 'warningOrange'
            });
            this.resultsSizeWarningPopup.attachTo(this.view.getResultsWarning());

            // If Collection Size > sort limit, show a warning message
            var collectionSizeWarning = new Notification({
                label: strings.get('sortingCollectionDisabled'),
                icon: 'dialogInfo',
                color: 'paleBlue',
                showAsToast: false,
                autoDismiss: false
            });
            collectionSizeWarning.attachTo(this.view.getCollectionSizeWarning());

            // Popup for Column Highlighting info icon
            var columnHighlightingInfoPopup = new InfoPopup({
                content: strings.get('columnHighlightingHelp')
            });
            columnHighlightingInfoPopup.attachTo(this.view.getInfoIconHolder());

            // NetworkExplorer.js publishes 'NetworkExplorer:*Hash' on page change
            this.getEventBus().subscribe('NetworkExplorer:defaultHash', this.showDefaultScreen, this);
            this.getEventBus().subscribe('NetworkExplorer:searchHash', this.loadSearch, this);
            this.getEventBus().subscribe('NetworkExplorer:collectionHash', this.loadCollection, this);
            this.getEventBus().subscribe('NetworkExplorer:savedSearchHash', this.loadSavedSearchInfo, this);
            this.getEventBus().subscribe('NetworkExplorer:appLoaded', this.resultsData.resetCurrentSearchOrPoId, this.resultsData);
            this.getEventBus().subscribe('Search:searchSubmit', this.loadSearch, this);
            this.getEventBus().subscribe('Search:cancelSearch', this.cancelSearch, this);
            this.getEventBus().subscribe('Search:SearchHidden', this.actOnSearchHidden, this);
            this.getEventBus().subscribe('QueryBuilder:searchSubmit', this.loadSearch, this);
            this.getEventBus().subscribe('QueryBuilder:QueryBuilderHidden', this.actOnQueryBuilderHidden, this);
            this.getEventBus().subscribe("Settings:updateColumns", this.onUpdateColumnsRequested, this);
            // Events: sendAllPoIdsToCallback & NetworkExplorer:sendSelectedPoIdsToCallback are used by intent page.
            this.getEventBus().subscribe('NetworkExplorer:sendAllPoIdsToCallback', sendAllPoIdsToCallback, this);
            this.getEventBus().subscribe('NetworkExplorer:sendSelectedPoIdsToCallback', sendSelectedPoIdsToCallback, this);
            // From user interaction with ResultsTable widget
            this.getEventBus().subscribe('resultstable:sortchanged', this.onSortChanged, this);
            this.getEventBus().subscribe('resultstable:selectionchanged', this.onSelectionChanged, this);
            this.getEventBus().subscribe('resultstable:beforerender', this.applyColumnHighlighting, this);
            this.getEventBus().subscribe('resultstable:resultschanged', this.onResultsChanged, this);

            if (this.ActionManager) {
                this.actionManager = new this.ActionManager({
                    resultsData: this.resultsData,
                    context: this.getContext()
                });
                this.getEventBus().subscribe('resultstable:showcontextualactions', this.showContextualActionsFor, this);
            } else {
                this.actionManager = new ActionManager_Interface();
            }

            this.getEventBus().subscribe('Search:resetLastLoadedSearchQuery', this.resultsData.resetLastLoadedSearchQuery, this.resultsData);
        },

        onViewReady: function() {
            if (this.options.showRightPanel) {
                this.view.showRightPanel();
            }
            this.view.getClearSelectionLink().addEventHandler('click', this.clearSelection, this);
        },

        /**
         * Create Table Widget and attach to DOM. Destroy and recreate if necessary
         *
         * Uses:
         * - this.counters.contextualAction
         * - this.resultsTable
         * - this.resultsData
         * - this.selectionObject
         * - this.tableColumns
         * - this.currentSort
         * - this.settingsItems
         * - this.actionManager
         *
         * @method createTable
         * @param {Function} callback Called when table is created with initial data
         */
        createTable: function (onTableCreated) {
            // Default callback
            onTableCreated = onTableCreated || function() { /*empty callback*/ };

            // Reset action counter
            this.counters.contextualAction = 0;

            // Use search data to create SelectionObject and VirtualScrollingData for result set
            var searchData = this.resultsData.getCurrentSearchData();
            var poList = searchData.objects.map(function(obj) { return obj.id; });
            this.selectionObject = new SelectionObject({
                id: this.ID,
                list: poList
            });
            this.displaySelectedObjectCount(0);
            this.virtualScrollingData = new VirtualScrollingData({
                id: this.ID,
                list: poList,
                attributeMappings: searchData.attributeMappings,
                errorCallback: this.onResultsTableError.bind(this),
                cache: this.cache
            });

            // Do an initial data fetch so we can calculate column widths
            this.virtualScrollingData.loadDataList(poList.slice(0,50)).then(function(initialData) {
                if(initialData.cancelled) {
                    return;
                }

                if(initialData.deletedIds && initialData.deletedIds.length) {
                    this.virtualScrollingData.removeIds(initialData.deletedIds);
                }

                // Populate the "Results (...)" field
                this.displayNumberOfResults(this.virtualScrollingData.getIdCount());

                // Add handler for Column Highlighting
                this.view.addCheckboxChangeEventHandler(this.onColumnHighlightCheckboxChanged, this);

                // If not predefined, create initial columns based on attributes and initial data
                if (!this.options.tableColumns) {
                    this.tableColumns = columnsUtil.getColumnsFromResponseObject(initialData.data, searchData.attributes);
                }
                this.settingsItems = columnsUtil.createColumnDefinitions(this.tableColumns);

                // Check if the dataset is sortable
                var isDataSortable = searchData.sortable === true || ( searchData.metadata && searchData.metadata.SORTABLE === true );
                // WORKAROUND
                // if services do not return sortable information, they are an older version and sorting should be enabled
                if (!isDataSortable) {
                    // collections || search
                    isDataSortable = searchData.sortable === undefined && (searchData.metadata === undefined || (searchData.metadata && searchData.metadata.SORTABLE === undefined));
                }
                // END WORKAROUND
                if (isDataSortable) {
                    // All rest endpoints that support sorting must sort by default
                    this.currentSort.direction = this.currentSort.direction || 'asc';
                    this.currentSort.attribute = this.currentSort.attribute || 'moName';
                } else {
                    // Sorting is not supported on the dataset
                    this.currentSort = undefined;
                    this.view.showCollectionSizeWarning();
                }

                // Detach any existing table
                if (this.resultsTable) {
                    this.resultsTable.destroy();
                }

                // Create the virtual table
                this.resultsTable = new ResultsTable({
                    columns: this.tableColumns,
                    sort: this.currentSort,
                    virtualScrollingData: this.virtualScrollingData,
                    selectionObject: this.selectionObject,
                    setHeightCallback: this.setHeightCallback,
                    context: this.getContext(),
                    multipleSelection: this.options.multipleSelection,
                    cache: this.cache,
                    isScopingPanel: this.isScopingPanel
                });
                this.resultsTable.attachTo(this.view.getTableHolder());
                this.resultsTable.setHeight();

                // Update default actions
                this.actionManager.updateDefaultActions();
            }.bind(this))
            .then(onTableCreated)
            .catch(function(error) {
                this.onResultsTableError(error);
            }.bind(this));
        },

        /**
         * Clear selected rows and Update action bar.
         */
        clearSelection: function() {
            this.resultsTable.clearSelectedRows();
            this.clearResultsContext();
            this.displaySelectedObjectCount(0);
            this.actionManager.updateDefaultActions();
            this.resultsTable.notifySelectionChange();
        },

        /**
         * React to "resultstable:selectionchanged" Event
         *
         * @param {SelectionObject} selectionObject A reference to the SelectionObject
         */
        onSelectionChanged: function(selectionObject){
            var count = selectionObject.getCount();
            this.displaySelectedObjectCount(count);
            this.publishPoidCount(count);
        },

        /**
         * React to "resultstable:showcontextualactions" Event
         *
         * @param {Array} objects Array of ManagedObjects picked from NetworkExplorer results
         */
        showContextualActionsFor: function(objects){
            this.getEventBus().publish('topsection:loader:show');
            var showContextualActionInstance = ++this.counters.contextualAction;
            if (objects.length > 0) {
                this.actionManager.getActions(objects, function(actionsToShow) {
                    if (showContextualActionInstance === this.counters.contextualAction) {
                        // Show actions in Action Bar
                        this.getEventBus().publish('topsection:loader:hide');
                        this.getEventBus().publish('topsection:contextactions', actionsToShow);
                        // Update Context Menu & unblock
                        var actionsWithoutActionBarOnly = actionsToShow.filter(function(action){
                            return !action.actionBarOnly;
                        });
                        this.getEventBus().publish('resultstable:contextactions', actionsWithoutActionBarOnly);
                    }
                }.bind(this));
            } else {
                this.getEventBus().publish('topsection:leavecontext');
            }
        },

        /**
         * When a request to update the columns is requested from a widget
         *
         * @method onUpdateColumnsRequested
         * @param settings
         */
        onUpdateColumnsRequested: function(settings) {
            this.settingsItems = columnsUtil.createColumnDefinitions(settings); // fed to Settings widget
            this.resultsTable.updateColumns(settings);
            // Remove the flyout
            Container.getEventBus().publish("flyout:hide");
        },

        /**
         * Event Handler for table SortableHeaders plugin
         *
         * Uses:
         * - this.selectionObject
         * - this.resultsTable
         * - this.currentSort
         * - ResultsStrings
         *
         * @param {Object} sort direction, attribute
         */
        onSortChanged: function (sort) {
            if (this.selectionObject.getCount() > 0) {
                var confirmationDialog = new Dialog({
                    header: strings.get('warning'),
                    type: 'warning',
                    content: strings.get('sortWarning'),
                    buttons: [{
                        caption: strings.get('dialogOkButtonLabel'),
                        action: function () {
                            confirmationDialog.hide();
                            this.sortTable(sort.direction, sort.attribute);
                        }.bind(this),
                        color: 'darkBlue'
                    }, {
                        caption: strings.get('dialogCancelButtonLabel'),
                        action: function () {
                            this.resultsTable.sort(this.currentSort);
                            confirmationDialog.hide();
                        }.bind(this)
                    }]
                });
                confirmationDialog.show();
            } else {
                this.sortTable(sort.direction, sort.attribute);
            }
        },

        /**
         * Warn the user that the netex services are currently offline
         */
        showServicesOfflineDialog: function() {
            if (!this.servicesOfflineDialog) {
                this.servicesOfflineDialog = new Dialog({
                    header: strings.get('serverUnavailableErrorHeader'),
                    type: 'warning',
                    content: strings.get('serverUnavailableErrorParagraphWithLink'),
                    buttons: [{
                        caption: strings.get('dialogRetryButtonLabel'),
                        action: function () {
                            window.location.reload();
                        }.bind(this),
                        color: 'darkBlue'
                    }, {
                        caption: strings.get('dialogCancelButtonLabel'),
                        action: function () {
                            this.servicesOfflineDialog.hide();
                        }.bind(this)
                    }]
                });
            }
            this.servicesOfflineDialog.show();
        },

        /**
         * Cancels all outstanding and created getPosByPoIds requests.
         */
        cancelVirtualScrollingDataFetch: function () {
            if(this.virtualScrollingData) {
                this.virtualScrollingData.cancelFetch();
            }
        },

        /**
         * Make Table Settings pane appear
         *
         * Uses:
         * - this.settingsItems
         */
        showTableSettings: function () {
            Container.getEventBus().publish("flyout:show", {
                header: strings.get('tableSettings'),
                content: new Settings({
                    context: this.getContext(),
                    columns: this.settingsItems
                })
            });
        },

        /**
         * Fetches a new list of poIds, sorted by the chosen column, and fetches the first page.
         *
         * Uses:
         * - this.currentSort
         * - this.resultsTable
         * - this.resultsData
         *
         * @param {String} direction The direction of the sort. "asc" or "desc"
         * @param {String} attribute The column to sort by
         */
        sortTable: function (direction, attribute) {
            this.disableTableRegion();
            this.currentSort = {
                direction: direction,
                attribute: attribute
            };
            this.resultsData.loadSortedData(this.resultsData.getCurrentSearchOrPoId(), attribute, direction, true);
        },

        /**
         * Display the current collection size
         *
         * @param {Number} collectionSize
         */
        displayNumberOfResults: function (collectionSize) {
            var delimitedCollectionSize = numberDelimiter(collectionSize).format('0,0');
            this.view.setNumberOfResultsText(delimitedCollectionSize);
        },

        /**
         * Takes the number of selected objects and displays with results.
         * Shows the "Clear" link when selected object count is greater than zero. Hides the link when count is zero.
         *
         * Uses:
         * - strings.numberOfSelectedObjects
         *
         * Calls:
         * - this.view.setSelectedObjectCountText
         */
        displaySelectedObjectCount: function(selectedObjectCount) {
            if(selectedObjectCount > 0) {
                this.view.showClearSelectionLink();
            } else {
                this.view.hideClearSelectionLink();
            }
            var delimitedSelectedObjectCount = numberDelimiter(selectedObjectCount).format('0,0');
            var selectedObjectsCountString = strings.get('numberOfSelectedObjects')
                .replace('$1', delimitedSelectedObjectCount);
            this.view.setSelectedObjectCountText(selectedObjectsCountString);
            this.displayAttributePanelDetails();
        },

        /**
         * Display attribute panel details. Get poId and publish to AttributesRegion component.
         */
        displayAttributePanelDetails: function() {
            var poId = this.selectionObject.getLast();
            if(poId) {
                this.getEventBus().publish('attributesRegion:load', poId);
            } else {
                this.getEventBus().publish('attributesRegion:clear');
            }
        },

        /**
         * React to "Search:SearchHidden" Event
         *
         * Uses:
         * - this.queryBuilderOn
         *
         * Calls:
         * - this.view.hideInfoMessage
         */
        actOnSearchHidden: function () {
            this.queryBuilderOn = true;
            this.view.hideInfoMessage();
        },

        /**
         * React to "QueryBuilder:QueryBuilderHidden" Event
         *
         * Uses:
         * - this.queryBuilderOn
         * - location.hash
         *
         * Calls:
         * - this.showDefaultScreen
         * - this.resultsTable.setHeight
         */
        actOnQueryBuilderHidden: function () {
            this.queryBuilderOn = false;
            if (/#networkexplorer\/*$/.test(location.hash)) {
                this.showDefaultScreen();
            }

            if(this.resultsTable) {
                this.resultsTable.setHeight(); // force set height if table is present
            }
        },

        /**
         * Leave the current results context. Deselects any selected objects.
         */
        clearResultsContext: function() {
            this.clearActionBarOptions();
            if (this.selectionObject) {
                this.selectionObject.clear();
            }
            this.publishPoidCount();
        },

        /**
         * Remove actions from Action Bar
         */
        clearActionBarOptions: function () {
            if (this.actionManager) {
                this.actionManager.reset(); // removes saved search from default
            }
        },

        /**
         * Publish event with length of selected poIds
         */
        publishPoidCount: function (count) {
            var poidCount = 0;
            if(count !== undefined) {
                poidCount = count;
            } else if (this.selectionObject) {
                poidCount = this.selectionObject.getCount();
            }
            this.getEventBus().publish("Results:selectionUpdated", poidCount);
        },

        /**
         * Hides the table and other messages and displays the default info message
         *
         * Uses:
         * - this.resultsData
         * - this.selectionObject
         * - this.queryBuilderOn
         */
        showDefaultScreen: function () {
            this.enableTableRegion();
            this.clearToasts();
            this.resultsData.abortFetch();
            this.resultsData.resetCurrentSearchOrPoId();
            this.resultsData.resetSavedSearchEnabled();
            this.hideResults();

            this.view.hideLoadingAnimation();
            this.view.hideErrorMessage();
            this.view.hideNoResultsMessage();
            this.view.hideCollectionSizeWarning();

            if (!this.queryBuilderOn) {
                this.view.showInfoMessage();
            }
            this.clearResultsContext();
            this.getEventBus().publish('attributesRegion:clear');
        },

        /**
         * EventBus subscription target. Called when a new request for objects is created.
         *
         * Uses:
         * - this.pageSizeSelectBox
         * - this.resultsData
         */
        fetchStarted: function () {
            this.clearResultsContext();
            this.view.hideInfoMessage();
            this.view.hideErrorMessage();
            this.view.hideNoResultsMessage();
            this.view.showLoadingAnimation();
            this.view.hideCollectionSizeWarning();
            this.hideResults();
            this.enableTableRegion();
        },

        /**
         * Shows a warning beside the page range above the table. Uses metadata from currentSearchData for text.
         *
         * Uses:
         * - this.resultsData
         * - this.resultsSizeWarningPopup
         * - ResultsStrings
         */
        showResultsSizeWarning: function () {
            var warningMessage = strings.get('resultsSizeWarningMessage')
                .replace('$1', this.resultsData.getCurrentSearchData().metadata.MAX_UI_CACHE_SIZE)
                .replace('$2', this.resultsData.getCurrentSearchData().metadata.RESULT_SET_TOTAL_SIZE);
            this.resultsSizeWarningPopup.setContent(warningMessage);
            this.view.showResultsSizeWarning();
        },

        /**
         * Hides the warning beside the page range above the table.
         */
        hideResultsSizeWarning: function () {
            this.view.hideResultsSizeWarning();
        },

        /**
         * Generic fetch success callback. Publishes the information of results set and either shows a table or no results message
         *
         * Uses:
         * - this.resultsData
         * - ResultsStrings
         *
         * @param type
         * @param name
         * @param searchTerm
         * @param poId
         */
        showInformation: function (type, name, searchTerm, poId) {
            this.view.hideInfoMessage();
            this.view.hideErrorMessage();
            if (this.resultsData.getCurrentSearchData().objects.length > 0) {
                this.view.hideNoResultsMessage();
                this.showResults();
            } else {
                this.hideResults();
                var noResultsString;
                this.view.setNoResultsErrorMessageHeaderText(strings.get('noResultsHeader'));

                if (this.resultsData.collectionInContext){
                    noResultsString = strings.get('emptyCollection');
                    this.view.setNoResultsErrorMessageHeaderText(strings.get('emptyCollectionHeader'));
                } else if(this.resultsData.getCurrentSearchData().metadata && this.resultsData.getCurrentSearchData().metadata.INFO_MESSAGE === 2002) {
                    noResultsString = singleSearchInfoTemplate(strings.get('noMatchFoundNodeAndMoSearch'));
                } else if (this.resultsData.getCurrentSearchData().metadata && this.resultsData.getCurrentSearchData().metadata.INFO_MESSAGE === 2001) {
                    noResultsString = singleSearchInfoTemplate(strings.get('noMatchFound'));
                } else{
                    noResultsString = strings.get('searchTermReturnedNoResults').replace('$1', searchTerm);
                }
                var noResultsElement = core.Element.parse(noResultsString);
                this.view.setNoResultsParagraphContent(noResultsElement);
                this.view.showNoResultsMessage();
            }

            this.showInfo({
                type: type,
                name: name,
                size: this.resultsData.getCurrentSearchData().objects.length,
                poId: poId
            });
        },

        /**
         * Generic fetch error callback
         *
         * @param errorBody Error details
         *          {userMessage: {title, body}}
         */
        showErrorMessage: function (errorBody) {
            this.hideResults();
            // This empties the table
            this.showInfo({
                size: 0
            });

            this.view.setErrorMessageHeaderText(errorBody.userMessage.title);
            if(errorBody.userMessage.body.constructor === {}.constructor){
                var serverTimeoutElement = core.Element.parse(requestTimeoutErrorTemplate(errorBody.userMessage.body));
                this.view.setErrorMessageParagraphAndListText(serverTimeoutElement);
            } else {
                this.view.setErrorMessageParagraphText(errorBody.userMessage.body);
            }

            this.view.hideInfoMessage();
            this.view.hideNoResultsMessage();
            this.view.showErrorMessage();

            this.view.hideSystemLogsLink();

            // if not possible to retrieve logs, skip creating link
            if(errorBody.isOffline || errorBody.objectNotFound) {
                return;
            }

            // Attempt to fetch data for a specific search in Log Viewer
            net.parallel({
                    type: 'GET',
                    dataType: 'json'
                },
                [{
                    url: this.REST_SYSTEMTIME
                },
                {
                    url: this.REST_USERPROFILE
                }],
                function (responses) {
                    this.showLogViewerLink(responses[0], responses[1], this.resultsData.getSearchTerm());
                }.bind(this)
            );
        },

        /**
         * Generates a link to Log Viewer for the given search and displays it
         *
         * @param {Object} time The time object returned from REST
         * @param {Object} user The user profile object returned from REST
         * @param {String} searchTerm The URI encoded search term that failed to return results
         */
        showLogViewerLink: function (time, user, searchTerm) {
            searchTerm = encodeURIComponent(decodeURIComponent(searchTerm).replace(/"/g,'\\"'));
            var startTime = new Date(time.timestamp); // timestamp is in UTC
            var endTime = startTime.toISOString();
            startTime.setMinutes(startTime.getMinutes()-2); //2 minutes previous to error
            startTime = startTime.toISOString();
            var systemLogsTargetURL =
                this.REST_LOGVIEWER_TEMPLATE[0] +
                searchTerm +
                this.REST_LOGVIEWER_TEMPLATE[1] +
                user.username +
                this.REST_LOGVIEWER_TEMPLATE[2] +
                startTime +
                this.REST_LOGVIEWER_TEMPLATE[3] +
                endTime;
            this.view.setSystemLogsLinkTarget(systemLogsTargetURL);
            this.view.showSystemLogsLink();
        },

        onResultsTableError: function (message, xhr) {
            this.fetchError(this.errorHandler.getErrorMessage(xhr));
        },

        /**
         * General fetch onError callback
         *
         * @param errorBody
         */
        fetchError: function (errorBody) {
            this.view.hideLoadingAnimation();
            this.view.hideSortLoader();
            this.hideResults();
            this.clearToasts();
            this.showErrorMessage(errorBody);
        },

        /**
         * fetchSavedSearchCollections onError callback
         *
         * @param errorBody
         */
        fetchSavedSearchCollectionsError: function (errorBody) {
            this.getEventBus().publish('Results:collectionFetchError', errorBody);
            this.fetchError(errorBody);
        },

        /**
         * Show the reissuingToast toast if not visible
         *
         * Uses:
         * - this.reissuingToast
         * - this.userWarningNotification
         * - ResultsStrings
         */
        showReissuingToast: function () {
            this.closeUserWarningToast();
            if (!this.reissuingToast) {
                this.reissuingToast = new Notification({
                    label: strings.get('reissueSearchSort'),
                    color: 'paleBlue',
                    showAsToast: true,
                    autoDismiss: false
                });
                this.reissuingToast.attachTo(this.getElement());
            }
        },

        /**
         * Close the reissuingToast toast if visible
         *
         * Uses:
         * - this.reissuingToast
         */
        closeReissuingToast: function () {
            if (this.reissuingToast) {
                this.reissuingToast.close();
                this.reissuingToast = undefined;
            }
        },

        /**
         * Close the userWarningNotification toast if visible
         *
         * Uses:
         * - this.userWarningNotification
         */
        closeUserWarningToast: function () {
            if (this.userWarningNotification) {
                this.userWarningNotification.close();
                this.userWarningNotification = undefined;
            }
        },

        /**
         * Cancel the search requests and publishes successful cancel event.
         */
        cancelSearch: function () {
            this.resultsData.abortFetch();
            this.view.hideLoadingAnimation();
            if(this.resultsData.isFetchPending()) {
                this.getEventBus().publish('Results:searchCancelled');
            }
        },

        /**
         *
         * @param searchTerm
         * @param sortColumn
         * @param sortDirection
         * @param forceUpdate
         */
        loadSearch: function (searchTerm, sortColumn, sortDirection) {
            this.currentSort = {
                direction: sortDirection,
                attribute: sortColumn
            };
            this.resultsData.loadSearch(searchTerm, sortColumn, sortDirection, true);
        },

        /**
         *
         * @param poId
         * @param sortColumn
         */
        loadCollection: function (poId, sortColumn, sortDirection) {
            this.currentSort = {
                direction: sortDirection,
                attribute: sortColumn
            };
            this.resultsData.loadCollection(poId, sortColumn, sortDirection, true);
        },

        /**
         *
         * @param poId
         * @param sortColumn
         */
        loadSavedSearchInfo: function (poId, sortColumn, sortDirection) {
            this.currentSort = {
                direction: sortDirection,
                attribute: sortColumn
            };
            this.resultsData.loadSavedSearchInfo(poId, sortColumn, sortDirection, true);
        },

        /**
         * Called after fetch success. Calls showInformation with arguments specific to searches
         */
        searchLoaded: function () {
            this.enableTableRegion();
            this.createTable(function() {
                this.view.hideLoadingAnimation();
                this.showInformation(undefined, strings.get('unsavedSearch'), this.resultsData.getSearchTerm());
                this.clearToasts();
            }.bind(this));
        },

        /**
         * Calls showInformation with arguments specific to collections
         */
        collectionLoaded: function () {
            this.enableTableRegion();
            this.createTable(function() {
                this.view.hideLoadingAnimation();
                this.showInformation('collection', this.resultsData.getCurrentSearchData().name, undefined, this.resultsData.getCurrentSearchData().id);
                this.clearToasts();
            }.bind(this));
        },

        /**
         * Triggers a fetch on the resultsCollection, which will in turn populate the table with the result
         *
         * @param savedSearchInfo
         */
        savedSearchLoaded: function (savedSearchInfo) {
            this.enableTableRegion();
            this.createTable(function() {
                this.view.hideLoadingAnimation();
                this.showInformation('savedSearch', savedSearchInfo.name, savedSearchInfo.searchQuery, savedSearchInfo.poId);
                this.getEventBus().publish('Results:setSearchField', savedSearchInfo.searchQuery);
                this.clearToasts();
            }.bind(this));
        },

        /**
         * Hides the pagination widget, table, and action panel.
         */
        hideResults: function () {
            this.view.hideTable();
            this.view.hideActionPanel();
        },

        /**
         * Shows the pagination widget, table, and action panel.
         */
        showResults: function () {
            this.view.showActionPanel();
            this.view.showTable();
        },

        /**
         * Dialog to show the launch of application has failed.
         *
         * Uses:
         * - ResultsStrings
         */
        showAppLaunchErrorDialog: function(appName, message) {
            var launchFailedDialog = new Dialog({
                type: 'error',
                header :  strings.get('launchFailed').replace('$1', appName),
                content : message,
                buttons : [{
                    caption : strings.get('dialogOkButtonLabel'),
                    action : function() {
                        launchFailedDialog.hide();
                    }.bind(this)
                }]
            });
            launchFailedDialog.show();
        },

        /**
         * Show user a warning that a retry is occuring
         *
         * Uses:
         * - ResultsStrings
         */
        showRetryWarning: function() {
            this.getEventBus().publish('Results:showToast', {
                label: strings.get('retryingToast'),
                color: 'yellow',
                icon: 'warning',
                autoDismiss: false,
                showAsToast: true,
                showCloseButton: false
            });
        },

        /**
         * Show user a warning that a retry is occurring
         *
         * Uses:
         * - ResultsStrings
         */
        hideRetryWarning: function() {
            this.getEventBus().publish('Results:removeToast');
        },

        /**
         * Publishes event to set search field in results region.
         *
         * @param String searchQuery
         */
        setSearchField: function (searchQuery) {
            this.getEventBus().publish('Results:setSearchField', searchQuery);
        },

        /**
         * Publishes event show info in results region.
         *
         * @param {Object} info
         */
        showInfo: function (info) {
            this.getEventBus().publish('Results:showInfo', info);
        },

        /**
         * Disables table region and shows sort loader
         */
        disableTableRegion: function () {
            this.view.disableTableRegion();
            this.view.showSortLoader();
        },

        /**
         * Enables table region and removes sort loader
         */
        enableTableRegion: function () {
            this.view.enableTableRegion();
            this.view.hideSortLoader();
        },

        /**
         * Removes all notification toasts
         */
        clearToasts: function () {
            this.closeUserWarningToast();
            this.closeReissuingToast();
        },

        /**
         * Iterates this.tableColumns and marks the header of columns with distinct values
         *
         * @method applyColumnHighlighting
         * @param {Array} results
         */
        applyColumnHighlighting: function (results) {
            var distinctColumns = [];
            this.tableColumns.forEach(function (tableColumn) {
                var tableColumnName = tableColumn.title;
                this.view.removeTableHeaderHighlightMarker(tableColumnName);
                var tableColumnAttribute = tableColumn.attribute;
                /*jshint loopfunc: true */
                results.forEach(function (element) {
                    if (results[0][tableColumnAttribute] !== element[tableColumnAttribute]) {
                        distinctColumns.push(tableColumnName);
                        //remove duplicate array values
                        distinctColumns = distinctColumns.filter(function (item, index, inputArray) {
                            return inputArray.indexOf(item) === index;
                        });
                    }
                });
            }.bind(this));
            distinctColumns.forEach(function(header){
                this.view.addTableHeaderHighlightMarker(header);
            }.bind(this));
        },

        /**
         * Enables/disables column highlighting based on highlight checkbox selection
         *
         * @method onColumnHighlightCheckboxChanged
         */
        onColumnHighlightCheckboxChanged: function () {
            if (this.view.isColumnHighlightingCheckboxSelected()) {
                this.view.enableColumnHighlighting();
            } else {
                this.view.disableColumnHighlighting();
            }
        },

        /**
         * Event Handler for result table changed
         *
         * @param {object} changes
         *          {array} deletedIds
         */
        onResultsChanged: function(changes) {
            if(changes && changes.deletedIds && changes.deletedIds.length>0) {
                this.virtualScrollingData.removeIds(changes.deletedIds);
                var resultsSize = this.virtualScrollingData.getIdCount();
                this.resultsTable.setTotalRows(resultsSize);
                this.displayNumberOfResults(resultsSize);

                this.selectionObject.removeIdsFromList(changes.deletedIds);
                var selectionCount = this.selectionObject.getCount();
                this.displaySelectedObjectCount(selectionCount);
                this.publishPoidCount(selectionCount);

                if( !this.deletedObjectTimerId ) {
                    this.deletedObjectTimerId = setTimeout(function() {
                        if (!this.deletedObjectsDetectedDialog) {
                            this.deletedObjectsDetectedDialog = new Dialog({
                                header: strings.get('deletedObjectsDetectedHeader'),
                                type: 'warning',
                                content: strings.get('deletedObjectsDetectedBody'),
                                buttons: [{
                                    caption: strings.get('dialogCleanupButtonLabel'),
                                    action: function () {
                                        window.location.reload();
                                    }.bind(this),
                                    color: 'darkBlue'
                                }]
                            });
                        }
                        this.deletedObjectsDetectedDialog.show();
                        delete this.deletedObjectTimerId;
                    }.bind(this), 20000);
                }
            } else if( this.deletedObjectTimerId ) {
                clearTimeout(this.deletedObjectTimerId);
                delete this.deletedObjectTimerId;

                this.getEventBus().publish('Results:showToast', {
                    label: strings.get('deletedObjectsDetectedToast'),
                    color: 'paleBlue',
                    autoDismiss: true,
                    showAsToast: true,
                    showCloseButton: true
                });
            }
        },
    });

    /**
     * Private function used for getting all poIds from resultsCollection
     *
     * @param {Function} callback
     */
    function sendSelectedPoIdsToCallback(callback) {
        callback(this.selectionObject.getObjects().map(function(obj) {
            return obj.id;
        }));
    }

    /**
     * Private function used for getting all poIds from resultsCollection
     *
     * @param {Function} callback
     */
    function sendAllPoIdsToCallback(callback) {
        callback(this.resultsData.getCurrentSearchData().objects.map(function(obj) {
            return obj.id;
        }));
    }

});
