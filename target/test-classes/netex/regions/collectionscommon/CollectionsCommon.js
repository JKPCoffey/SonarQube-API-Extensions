define([
    'jscore/core',
    'jscore/ext/net',
    './CollectionsCommonView',
    'container/api',
    'template!./requestTimeoutErrorTemplate.html',
    'networkexplorerlib/rest/classes/UserPermissions',
    'networkexplorerlib/widgets/filterSelection/FilterSelection',
    'networkexplorerlib/widgets/favouritecell/FavouriteCell',
    '../../classes/ErrorHandler',
    '../../classes/FieldCompare',
    'tablelib/Table',
    'tablelib/plugins/VirtualScrolling',
    'tablelib/plugins/VirtualSelection',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/SmartTooltips',
    'tablelib/plugins/RowEvents',
    'widgets/Notification',
    'i18n/AdvancedDateTimeWithZones',
    'i18n/number',
    'i18n!networkexplorerlib/collectionscommon.json'
], function(
    core,
    net,
    View,
    container,
    requestTimeoutErrorTemplate,
    UserPermissions,
    FilterSelection,
    FavoriteCell,
    ErrorHandler,
    FieldCompare,
    Table,
    VirtualScrolling,
    VirtualSelection,
    ResizableHeader,
    SortableHeader,
    SmartTooltips,
    RowEvents,
    Notification,
    dateTime,
    number,
    strings
) {
    /**
     * Shared Region
     *
     * Options:
     *   enableMultipleSelection: {Boolean} true enables multiple rows selection (Default is false)
     *   onlyShowEditable: {Boolean} true enables the display of resources that can be updated (Default is false)
     *   tableColumns: {Object} description of columns visualization (optional)
     *   {
     *      name|owner|sharing|date|favourites: {
     *          visible: {Boolean} false columns is hidden (default is true)
     *          width: {String} initial width for the columns, format is "<value>px"
     *      }
     *   }
     *
     *   tableColumnsModifiers: {Object} description of columns visualization (optional)
     *   {
     *      owner|sharing|date|favourites: {
     *          title: {String} name to assign (default "table" string present in collectionscommon.json)
     *      }
     *   }
     *   filter: {Object} Optional, if enabled, enables the display of resources that meet the enabled
     *           filters (Default is undefined)
     *           {
     *              update {Boolean} resources that the user can change
     *           }
     *   enableFullView: {Boolean} true enables show of all columns (Default is false)
     *   serverLocation: {String} IANA timezone format e.g. America/Los_Angeles
     *
     * @class CollectionsCommon
     *
     */
    return core.Region.extend({

        view: function () {
            return new View({
                stringsImpl: this.getStringsImpl()
            });
        },

        RETRY_INTERVALS: [2000, 5000, 10000],

        /*
         * Object lifecycle method
         */
        init: function() {
            this.displayedCollectionsData = [];
            this.collectionsData = [];
            this.sort = {
                mode: 'asc',
                attribute: 'name'
            };

            this.favoriteCollectionRetries = 0;
            this.allCollectionRetries = 0;
            this.selectedCollections = [];
            this.disableNextRowSelectEndEvent = false;
            this.options.enableMultipleSelection = this.options.enableMultipleSelection === true;
            this.options.onlyShowEditable = this.options.onlyShowEditable === true;
            this.timezone = this.options.serverLocation || Intl.DateTimeFormat().resolvedOptions().timeZone;
        },

        /*
         * Region lifecycle method
         */
        onStart: function() {
            this.userPermissions = new UserPermissions();
            this.loadCollections();
        },

        /*
         * Region lifecycle method
         */
        onStop: function() {
            this.clearTable();
            this.view.hideTitleAndFilters();
        },

        /*
         * Region lifecycle method
         */
        onViewReady: function() {
            core.Window.addEventHandler('resize', this.setContentHeight.bind(this));
            if (this.options.enableMultipleSelection) {
                this.updateSelectedCount(0);
                this.view.showSelected();
            } else {
                this.view.hideSelected();
            }

            this.view.hideLoader();
            this.view.hideErrorMessage();
            this.view.hideInfoMessage();
            this.view.hideToast();
            this.view.hideTitleAndFilters();
            this.clearTable();
            this.initializeFilterButtons();
        },

        /**
         * It returns the class that manages the Favourites REST API.
         * This method must be implemented in derived classes.
         *
         * @Abstract
         * @method getFavouriteManagementApi
         * @return {Object} class ref
         */
        getFavouriteManagementApi: function() {
            throw new Error("Not Implemented");
        },

        /**
         * It returns the locale strings for the specific derived classes.
         * This method must be implemented in derived classes.
         *
         * @Abstract
         * @method getStringsImpl
         * @return {Object} map of strings (i18n)
         */
        getStringsImpl: function() {
            throw new Error("Not Implemented");
        },

        /**
         * It converts the response data from REST to table format.
         * This method must be implemented in derived classes.
         *
         * @Abstract
         * @method convertRestDataToTableData
         * @param {Object} data from rest response
         * @return {Object} list of table compliant struct data
         */
        convertRestDataToTableData: function() {
            throw new Error("Not Implemented");
        },

        /**
         * It filters depending on user permissions
         *
         * @method applyPermissionFilters
         * @param {object} collections to be filtered
         * @return {object} filtered collections
         */
        applyPermissionFilters: function(collections) {
            return collections;
        },

        /**
         * It allows to extend a base table with additional columns.
         * A derived class must ovveride the method if it needs to add columns to the table.
         *
         * @method getAdditionalColumns
         * @return {list} list of additional columns descriptors
         */
        getAdditionalColumns: function() {
            return [];
        },


        /**
         * It create event Id with specific source.
         * A derived class must ovveride the method if it needs to create specific event.
         *
         * @method createEventId
         * @param {String} name of event
         * @return {String} event Id in formati <source>:<event name>
         */
        createEventId: function( eventName ) {
            return 'CollectionsCommon:'+eventName;
        },


        /**
         * It create array with columns description to table.
         *
         * @private
         * @method getTableColumns
         * @return {[{}]} array with columns description to create the table.
         */
        getTableColumns: function() {
            var columns = [
                { title: strings.get('table.id'), attribute: 'id', visible: false },
                { title: strings.get('table.name'), attribute: 'name', sortable: true, initialSortIcon: 'asc', resizable: true },
                { title: strings.get('table.owner'), attribute: 'owner', sortable: true, initialSortIcon: 'asc', resizable: true, width: '160px', visible: true },
                { title: strings.get('table.sharing'), attribute: 'sharing', sortable: true, initialSortIcon: 'asc', resizable: true, width: '180px', visible: true },
                { title: strings.get('table.modified'), attribute: 'date', sortable: true, initialSortIcon: 'asc', resizable: true, width: '125px', visible: true },
                { title: strings.get('table.favorites'), attribute: 'favourites', cellType: FavoriteCell, sortable: true, initialSortIcon: 'asc', resizable: true, width: '110px', visible: true }
            ];

            var additionalColumns = this.getAdditionalColumns();
            for( var index=0; index<additionalColumns.length; index++ ) {
                if( !additionalColumns[index].resizable ) {
                    additionalColumns[index].resizable = true;
                }

                if( !additionalColumns[index].visible ) {
                    additionalColumns[index].visible = true;
                }

                columns.push(additionalColumns[index]);
            }

            for(var columnIndex=0; columnIndex<columns.length; columnIndex++) {
                var attribute = columns[columnIndex].attribute;
                if( this.options.tableColumns && this.options.tableColumns[attribute] ) {
                    columns[columnIndex].visible = this.options.tableColumns[attribute].visible;
                    if( this.options.tableColumns[attribute].width !== undefined ) {
                        columns[columnIndex].width = this.options.tableColumns[attribute].width;
                    }
                }

                if( this.options.tableColumnsModifiers && this.options.tableColumnsModifiers[attribute] &&
                    this.options.tableColumnsModifiers[attribute].title ){
                    columns[columnIndex].title = this.options.tableColumnsModifiers[attribute].title;
                }
            }

            return columns;
        },

        /**
         * Create Table Widget and attach to DOM.
         *
         * @private
         * @method createAndShowTable
         */
        createAndShowTable: function() {
            this.table = new Table({
                plugins: [
                    new RowEvents({
                        events: ['contextmenu']
                    }),
                    new ResizableHeader(),
                    new SortableHeader(),
                    new SmartTooltips(),
                    new VirtualScrolling({
                        totalRows: this.displayedCollectionsData.length,
                        annotationEnabled: false,
                        getData: function(index, length, success) {
                            success(this.displayedCollectionsData.slice(index, index + length));
                        }.bind(this),
                        redrawMode: VirtualScrolling.RedrawMode.SOFT
                    }),
                    new VirtualSelection({
                        checkboxes: this.options.enableMultipleSelection,
                        selectableRows: true,
                        multiselect: this.options.enableMultipleSelection,
                        bind: this.options.enableMultipleSelection,
                        getAllIds: function(success) {
                            success(this.displayedCollectionsData.map(function(e) {
                                return e.id;
                            }));
                        }.bind(this)
                    })
                ],
                modifiers: [
                    { name: 'striped' }
                ],
                columns: this.getTableColumns()
            });

            this.table.setSortIcon(this.sort.mode, this.sort.attribute);
            this.displayedCollectionsData = this.collectionsData;

            this.updateNumberOfCollections(this.displayedCollectionsData.length);

            this.table.addEventHandler('sort', this.sortResults, this);
            this.table.addEventHandler('columnresize', this.storageColumnSize.bind(this));

            if (this.options.enableMultipleSelection) {
                this.table.addEventHandler('idselectend', function () {
                    if (!this.disableNextRowSelectEndEvent) {
                        this.notifySelectedResourcesChange( this.table.getCheckedIds() );
                        this.getEventBus().publish( this.createEventId('contextmenuhide'));
                    }
                    this.disableNextRowSelectEndEvent = false;
                }.bind(this), this);

                this.table.addEventHandler("rowevents:contextmenu", this.onRowEventContextMenu.bind(this));
            } else {
                this.table.addEventHandler('rowselect', this.onRowSelect, this);
            }
            this.view.showTitleAndFilters( !this.options.enableMultipleSelection );
        },

        /**
         * It stores the columns size in a localStorage.
         *
         * @private
         * @method storageColumnSize
         * @param {Object}: column descriptor
         */
        storageColumnSize: function(col) {
            var localStorageName = 'elNetworkExplorerLib-r' + this.regionId + '-content-colWidths';

            var ls = JSON.parse(localStorage[localStorageName] || '{}');
            ls[col.attribute] = col.width;
            localStorage[localStorageName] = JSON.stringify(ls);
        },

        /**
         * Callback to handle context menu when issued.
         *
         * @private
         * @method onRowEventContextMenu
         * @param {Object} row: the selected rows
         * @param {Object} e: event
         */
        onRowEventContextMenu: function(row, e) {
            var id = row.getData().id;
            if (this.table.getSelectedIds().indexOf(id) === -1 && !e.originalEvent.ctrlKey) {
                this.disableNextRowSelectEndEvent = true;
                this.table.unselectAllIds();
                this.table.addSelectedIds(id);
                this.notifySelectedResourcesChange( this.table.getCheckedIds() );
            }
            // If there is any row selected then show context menu
            this.getEventBus().publish( this.createEventId('contextmenushow'), e);
        },

        /**
         * Shows number of collections on DOM.
         *
         * @private
         * @method updateNumberOfCollections
         */
        updateNumberOfCollections: function(numOfCollections) {
            var formattedNumOfCollections = number(numOfCollections).format('0,0');
            var numberOfCollectionsString = strings.get('numberOfCollections').replace('$1', formattedNumOfCollections);
            this.view.setNumberOfCollections(numberOfCollectionsString);
        },


        /**
         * This is the callback triggered on the selection event of the row.
         * This method propagates the event to the other regions.
         *
         * @private
         * @method onRowSelect
         * @param {Object} selectedRow  the selected row
         * @param {Boolean} isSelected  if TRUE row is selected otherwise is unselected.
         */
        onRowSelect: function(selectedRow, isSelected) {
            if (!this.options.enableMultipleSelection) {
                this.table.removeSelectedIds(this.table.getSelectedIds());
            }

            if (isSelected) {
                var id = selectedRow.getData().id;
                this.table.addSelectedIds(id);
                this.notifySelectedResourcesChange( [id] );
            } else {
                this.notifySelectedResourcesChange( [] );
            }
        },


        /**
         * Refreshes list of selected entries and sends a notification if it detects a variation.
         *
         * @private
         * @method notifySelectedResourcesChange
         * @param listSelection {[String]} list of Id selected
         * @param fetchEvent {boolean} forced resend event in all case (this is required to refreshed action buttons
         *                   when favourites/unfavourites is selected )
         */
        notifySelectedResourcesChange: function( listSelection, fetchEvent ) {
            var prevSelectedCollections = this.selectedCollections;
            var sendEvent = fetchEvent || false;
            this.selectedCollections = [];
            var selectedCollectionsId = [];
            var isSelected = (listSelection.length > 0);

            this.updateSelectedCount( listSelection.length );

            for( var entry = 0; entry<this.displayedCollectionsData.length; entry++ ) {
                if( listSelection.indexOf( this.displayedCollectionsData[entry].id ) !== -1 ) {

                    this.selectedCollections.push(this.displayedCollectionsData[entry]);
                    selectedCollectionsId.push({
                        id: this.displayedCollectionsData[entry].id
                    });

                    if(!sendEvent) {
                        sendEvent = !this.isPoIdInList( prevSelectedCollections, this.displayedCollectionsData[entry].id );
                    }
                }
            }

            if( sendEvent || (prevSelectedCollections.length !== this.selectedCollections.length) ) {
                this.getEventBus().publish(this.createEventId('collectionSelected'), isSelected, selectedCollectionsId, this.selectedCollections);
            }
        },

        /**
         * Check if PoId exists in list.
         *
         * @private
         * @method isPoIdInList
         * @param list {[Object]}
         * @param poId {String} PoId to find in list.
         * @return {Boolean} True if PoId is present in list
         */
        isPoIdInList: function( list, poId ) {
            return  undefined !== list.find(function(rowData) {
                    return rowData.id === poId;
                });
        },

        /**
         * Function called on event notification of the change of sorting by the user.
         *
         * @private
         * @method sortResults
         * @param {String} sort  asc if the user wants to sort ascending, desc if the desired sort is descending.
         * @param {String} attribute identifier of the column on which the user has made ​​the choice.
         */
        sortResults: function(sort, attribute) {
            this.sort.mode = sort;
            this.sort.attribute = attribute;
            this.applyUserDefinedFilters();
        },

        /**
         * Function to retain Collections selected after sort.
         *
         * @method retainCollectionsSelected
         */
        retainCollectionsSelected: function() {
            if( this.table ) {
                if (this.options.enableMultipleSelection) {
                    this.table.unselectAllIds();
                    for (var idIndex = 0; idIndex < this.selectedCollections.length; idIndex++) {
                        // Check the selected item is a visible in the table.
                        if(this.isPoIdInList(this.displayedCollectionsData, this.selectedCollections[idIndex].id)) {
                            this.table.addCheckedIds(this.selectedCollections[idIndex].id);
                        }
                    }
                    this.notifySelectedResourcesChange( this.table.getCheckedIds() );
                } else {
                    if (this.selectedCollections.length > 0) {
                        this.table.addSelectedIds(this.selectedCollections[0].id);
                    }
                }
            }
        },

        /**
         * Function to sort an attribute case insensitive (tablelib sort API does not handle it).
         *
         * @private
         * @method sortResults
         * @param {Array} data the array to sort
         * @param {String} sort  asc if the user wants to sort ascending, desc if the desired sort is descending.
         * @param {String} attribute identifier of the column on which the user has made ​​the choice.
         */
        sortByKey: function(data, sort, attribute) {
            var sortFn = (attribute === 'date') ? FieldCompare.compareDate : FieldCompare.compareString;
            if (sort === 'asc') {
                return data.sort(function (a, b) { return sortFn(a[attribute], b[attribute]); } );
            } else if (sort === 'desc') {
                return data.sort(function (a, b) { return sortFn(b[attribute], a[attribute]); } );
            }
        },

        /**
         * Function called to load collections from server; it shows loader animation.
         *
         * @private
         * @method loadCollections
         */
        loadCollections: function() {
            this.view.showLoader();
            this.reload();
        },

        /**
         * Function called to fetch data from server.
         *
         * @method reload
         */
        reload: function() {
            this.fetchFavorite();
        },

        /**
         * Destroy table from DOM and clears data
         *
         * @private
         * @method clearTable
         */
        clearTable: function() {
            if (this.table) {
                this.table.detach();
                this.table.destroy();
            }

            this.displayedCollectionsData = [];
            this.collectionsData = [];
            this.table = undefined;

            if( this.filterSelection ) {
                this.filterSelection.clear();
            }
        },

        /**
         * Call REST Endpoint interface to get the profile of the currently logged in user
         *
         * @method fetchUserProfile
         */
        fetchUserProfile: function() {
            this.userPermissions.fetch({
                success: this.fetchCollections.bind(this),
                error: this.retryFetchAll.bind(this)
            });
        },

        /**
         * Call retry fetch with "all" parameter
         *
         * @method retryFetchAll
         * @param {Object} collection: Collection on which fetch failed
         * @param {Object} xhr: xhr for failed fetch
         */
        retryFetchAll: function(collection, xhr) {
            if(xhr.getStatus() === 403) {
                this.displayErrorMessage(xhr);
            } else {
                this.retryFetch(collection, xhr, 'all');
            }
        },

        /**
         * Call REST Endpoint interface to get all collections
         *
         * @private
         * @method fetchCollections
         */
        fetchCollections: function() {
            net.ajax({
                url: this.resourceURL,
                type: 'GET',
                dataType: 'json',
                success: this.collectionFetchSuccess.bind(this),
                error: this.retryFetchAll.bind(this)
            });
        },

        /**
         * Success callback for fetching collections. Will merge favorites with collections
         * if the favorites are loaded, then re-render the list with the merged collection.
         *
         * @private
         * @method collectionsFetchSuccess
         * @param {Array|Object} fetchedCollections: Responses for parallel fetches
         */
        collectionFetchSuccess: function(fetchedCollections) {
            var collections = this.convertRestDataToTableData(fetchedCollections);

            this.view.hideLoader();
            this.getEventBus().publish(this.createEventId('collectionsLoaded'));

            this.allCollectionRetries = 0;
            this.collectionsData = this.applyPermissionFilters(collections);

            if (this.collectionsData.length === 0) {
                this.showNoCollectionsInfo();
            } else {
                if (!this.table) {
                    this.createAndShowTable();
                }
                this.applyUserDefinedFilters();
                this.retainCollectionsSelected();
            }

        },

        /**
         * get all favourite collections
         *
         * @private
         * @method fetchFavorite
         */
        fetchFavorite: function() {
            this.getFavouriteManagementApi().fetchFavourite({
                success: function() {
                    this.favoriteCollectionRetries = 0;
                    this.fetchUserProfile();
                }.bind(this),
                error: function(collection, xhr) {
                    this.retryFetch(collection, xhr, 'favorite');
                }.bind(this)
            });
        },

        /**
         * set the favorite state for the selected collections using REST.
         *
         * @method setSelectedFavorite
         * @param {Boolean} favourite: favourite state of selected collections to set
         */
        setSelectedFavorite: function(favourite) {
            this.getFavouriteManagementApi().setFavourite({
                ids: this.table.getSelectedIds(),
                favourite : favourite,
                eachsuccess: function(poId) {
                    this.collectionsData.find(function(dt) { return dt.id === poId; }, this).favourites = favourite;
                }.bind(this),
                success: function() {
                    this.notifySelectedResourcesChange( this.table.getCheckedIds(),true );
                    this.applyUserDefinedFilters();
                    this.retainCollectionsSelected();
                    container.getEventBus().publish('container:loader-hide');
                }.bind(this),
                error: function(collection, xhr) {
                    this.displayErrorMessage(xhr);
                    container.getEventBus().publish('container:loader-hide');
                }.bind(this)
            });
        },

        /**
         * Callback to handle error case for get all favourite collections and get all collections.
         * It retries three times to connect to server, showing an inline warning message, after that an error message is showed
         *
         * @private
         * @method retryFetch
         */
        retryFetch: function(collection, xhr, type) {
            if (this[type + 'CollectionRetries'] === 0) {
                this.addToast();
            }
            if (this.RETRY_INTERVALS[this[type + 'CollectionRetries']]) {
                this.retryTimer(this.RETRY_INTERVALS[this[type + 'CollectionRetries']], type);
            } else {
                this.removeToast();
                this.displayErrorMessage(xhr);
                this.view.hideLoader();
            }
        },

        /**
         * Starts a timer waiting before retrying to connect again to the server.
         *
         * @private
         * @method retryTimer
         * @param {Number} duration: duration of the timer
         * @param {String} type: type of rest call to retry after timer expiring
         *                 ("all" for get all collections, "favorite" for get favourite collections)
         */
        retryTimer: function(duration, type) {
            setTimeout(function() {
                this[type + 'CollectionRetries']++;
                if(type === 'favorite') {
                    this.fetchFavorite();
                } else {
                    this.fetchUserProfile();
                }
            }.bind(this), duration);
        },

        /**
         * Display an error message after unsuccessful attempt to connect to server.
         *
         * @private
         * @method displayErrorMessage
         * @param {Object} xhr: response from server
         */
        displayErrorMessage: function(xhr) {
            this.view.hideTable();
            this.view.hideLoader();

            var errorHandler = new ErrorHandler();
            var errorBody = errorHandler.getErrorMessage(xhr);

            this.view.setErrorMessageHeaderText(errorBody.userMessage.title);
            this.setErrorMessageParagraph(errorBody.userMessage.body);
            this.view.showErrorMessage();
        },

        /**
         * Display error message in format compact or multi line.
         *
         * @private
         * @method setErrorMessageParagraph
         * @param {Object} userMessageBody: body of server response
         */
        setErrorMessageParagraph: function( userMessageBody ) {
            if(userMessageBody.constructor === {}.constructor){
                var serverTimeoutElement = core.Element.parse(requestTimeoutErrorTemplate(userMessageBody));
                this.view.setErrorMessageParagraphAndListText(serverTimeoutElement);
            } else {
                this.view.setErrorMessageParagraphText(userMessageBody);
            }
        },


        /**
         * Shows inline warning message after first unsuccessful attempt to connect to server.
         *
         * @private
         * @method addToast
         */
        addToast: function() {
            if (!this.notification) {
                this.notification = new Notification({
                    label: strings.get('retryingToast'),
                    color: 'yellow',
                    icon: 'warning',
                    autoDismiss: false,
                    showAsToast: false,
                    showCloseButton: false
                });

                this.notification.attachTo(this.view.getToastEl());
                this.view.showToast();
            }
        },

        /**
         * Shows inline warning after first unsuccessful attempt to connect to server.
         *
         * @private
         * @method removeToast
         */
        removeToast: function() {
            if (this.notification) {
                this.notification.close();
                delete this.notification;
            }
            this.view.hideToast();
        },

        /**
         * Initialize filter buttons (All, Public, Private and Favorites) and define click event callbacks for them.
         *
         * @private
         * @method initializeFilterButtons
         */
        initializeFilterButtons: function() {
            this.filterSelection = new FilterSelection();
            this.filterSelection.attachTo( this.view.getFilterSelection() );
            this.filterSelection.addEventHandler('FilterSelection::change', this.onChangeFilterSelection, this);
        },

        /**
         * It execute common action after filter activation.
         *
         * @private
         * @method postFilterActivation
         */
        onChangeFilterSelection: function() {
            if( this.table ) {
                if(!this.options.enableMultipleSelection) {
                    this.table.unselectAllIds();
                } else {
                    this.table.uncheckAllIds();
                    this.updateSelectedCount(0);
                }

                this.applyUserDefinedFilters();
                this.notifySelectedResourcesChange( [] );
            }
        },

        /**
         * Refresh Table Widget, hiding any info message and displaying it again.
         * Attaches Table Widget to DOM
         *
         * @private
         * @method refreshTable
         */
        refreshTable: function() {
            this.view.hideInfoMessage();
            if (!this.table.isAttached()) {
                this.table.attachTo(this.view.getContentEl());
            }
            this.view.showTable();
            this.onTableDataChanged();
        },


        /**
         * Attach to DOM the info message about no collections found (on server side or after applying filters).
         *
         * @private
         * @method   showNoCollectionsInfo
         */
        showNoCollectionsInfo: function() {
            this.view.hideTitleAndFilters();

            if (this.table) {
                this.view.hideTable();
            }
            this.view.hideLoader();
            this.view.showInfoMessage();
            this.view.setInfoMessageHeader(this.getStringsImpl().get('noObjectsHeader'));
            this.view.setInfoMessageParagraph(this.getStringsImpl().get('noObjectsParagraph'));
        },

        /**
         * Apply all active filters and refresh results.
         *
         * @private
         * @method applyUserDefinedFilters
         */
        applyUserDefinedFilters: function() {
            var filteredData = this.filterSelection.applyFilters(this.collectionsData);

            this.displayedCollectionsData = this.sortByKey(filteredData, this.sort.mode, this.sort.attribute);
            this.table.setTotalRows(this.displayedCollectionsData.length);
            this.updateNumberOfCollections(this.displayedCollectionsData.length);
            this.refreshTable();
        },

        /**
         * Show on DOM the number of selected rows (only when multiselection mode is selected)
         *
         * @private
         * @method updateSelectedCount
         * @param {Number} numberOfSelectedCollections the number of selected rows
         */
        updateSelectedCount: function(numberOfSelectedCollections) {
            var formattedNumOfSelectedCollections = number(numberOfSelectedCollections).format('0,0');
            var numberOfSelectedString = strings.get('numberOfSelected').replace('$1', formattedNumOfSelectedCollections);
            this.view.setNumberOfSelected(numberOfSelectedString);
        },

        /**
         * It performs a table refresh when the table data change
         *
         * @private
         * @method onTableDataChanged
         */
        onTableDataChanged: function() {
            if (this.table) {
                this.table.setTotalRows(this.displayedCollectionsData.length);
                this.table.reload();
                this.table.redraw();
            }
        },

        /*
         * This method change height of content from externally.
         *
         * @method setContentHeight
         */
        setContentHeight: function() {
            if (this.view.getOffsetHeight() > 0) {
                var tableHeight = this.view.getTableHeight();
                if (this.tableHeightSet !== tableHeight) {
                    this.tableHeightSet = tableHeight;
                    this.view.setContentElHeight(tableHeight);
                    this.onTableDataChanged();
                }
            }
        },

        /**
         * It removes from the in-memory list the selected collections.
         *
         * @method removedSelectedCollection
         * @param {[]} list of id removed
         */
        removedSelectedCollection: function( removeIdList ) {
            if( removeIdList && removeIdList.length>0 ) {
                var subsetCollectionChange = this.collectionsData.filter(function(element) {
                    return removeIdList.indexOf(element.id) !== -1;
                }.bind(this));

                for (var index = 0; index < subsetCollectionChange.length; index++) {
                    this.collectionsData.splice(this.collectionsData.indexOf(subsetCollectionChange[index]), 1);
                }
            }
            this.table.unselectAllIds();
            this.updateSelectedCount(0);
            this.getEventBus().publish(this.createEventId('collectionSelected'), false);
            this.applyUserDefinedFilters();
            this.retainCollectionsSelected();
            if (this.collectionsData.length === 0) {
                this.showNoCollectionsInfo();
            }
        },

        /**
         * It convert the timestamp to a format that can be shown in table.
         *
         * @method convertTimestampToViewInTable
         * @param {Number} timestamp to convert
         * @return {string} converted date
         */
        convertTimestampToViewInTable: function ( timestamp ) {
            if( timestamp ) {
                var timeCreated = new Date(parseInt(timestamp, 10));
                return dateTime(timeCreated).tz(this.timezone).format('DT');
            }

            return strings.get('notAvailable');
        }
    });
});
