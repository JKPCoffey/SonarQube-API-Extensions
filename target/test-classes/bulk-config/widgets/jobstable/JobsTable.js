define([
    'jscore/core',
    './JobsTableView',
    'container/api',
    'i18n!bulkimportlib/dictionary.json',
    '../virtualtable/VirtualTable',
    '../tablesetting/TableSetting',
    '../alertcell/AlertCell',
    '../JobFilters',
    './JobsTableDataService',
    'jscore/ext/privateStore',
    'widgets/Tooltip',
    'widgets/InlineMessage'
], function(core, View, Container, dictionary, Table, TableSetting, AlertCell, JobFilters, JobsTableDataService,
    PrivateStore, Tooltip, InlineMessage) {

    var _ = PrivateStore.create();

    var COLUMNS = [
        {title: dictionary.jobTable.columnName.jobName, attribute: 'name', resizable: true, width: 160},
        {title: dictionary.jobTable.columnName.jobID, attribute: 'id', resizable: true, width: 62},
        {title: dictionary.jobTable.columnName.jobState, attribute: 'status', resizable: true, width: 100},
        {title: dictionary.jobTable.columnName.totalOperations, attribute: 'parsed', resizable: true, width: 120},
        {title: dictionary.jobTable.columnName.succesExecOperation, attribute: 'succesExecuted', resizable: true, width: 160},
        {title: dictionary.jobTable.columnName.validError, attribute: 'invalid', resizable: true, cellType: AlertCell, bgColor: '#ff7600', width: 130},
        {title: dictionary.jobTable.columnName.execErrors, attribute: 'executionErrors', resizable: true, cellType: AlertCell, bgColor: '#e32119', width: 130},
        {title: dictionary.jobTable.columnName.jobCreationDate, attribute: 'created', resizable: true, width: 135},
        {title: dictionary.jobTable.columnName.createBy, attribute: 'userId', resizable: true, width: 94},

        {title: dictionary.jobTable.columnName.fileErrors, attribute: 'failures', visible: false, resizable: true, width: 100},
        {title: dictionary.jobTable.columnName.validOperations, attribute: 'valid', visible: false, resizable: true, width: 100},
        {title: dictionary.jobTable.columnName.execOperation, attribute: 'executed', visible: false, resizable: true, width: 100}
    ];
    var delayTimer;

    return core.Widget.extend({
        View: View,

        init: function() {
            _(this).dataService = new JobsTableDataService();
            _(this).dataService.addObserver(this.dataServiceObserver, this);
            _(this).table = createJobsTable.call(this, 0, COLUMNS);
            _(this).tableSettings = new TableSetting({
                columns: COLUMNS.map(mapToColumnDefinitions)
            });
            _(this).jobFilters = new JobFilters();
            this.errorDashboard = null;
            this.infoDashboard = null;
            window.addEventListener('hashchange', this.hashChange.bind(this));
        },

        onViewReady: function() {
            _(this).table = createJobsTable.call(this, 0, COLUMNS);
            _(this).tableSettings = new TableSetting({
                columns: COLUMNS.map(mapToColumnDefinitions)
            });
            _(this).table.attachTo(this.view.getTableHolder());
            _(this).filter = this.view.getFilterArea();
            _(this).filter.addEventHandler('input', filterByJobNameAndId, this);
            _(this).clearFilterLink = this.view.getClearFilterLink();
            _(this).clearFilterLink.addEventHandler('click', this.clearFilters, this);
            _(this).settingsButton = this.view.getSettingsButton();
            _(this).settingsButton.addEventHandler('click', showTableSettings, this);
            _(this).filtersButton = this.view.getFiltersButton();
            _(this).filtersButton.addEventHandler('click', showJobFilters, this);
            _(this).myJobsFilterButton = this.view.getMyJobsFilterButton();
            _(this).myJobsFilterButton.addEventHandler('click', this.myJobsFilter, this);
            _(this).validationErrorsButton = this.view.getValidationErrorsButton();
            _(this).validationErrorsButton.addEventHandler('click', this.validationErrorsFilter, this);
            _(this).executionErrorsButton = this.view.getExecutionErrorsButton();
            _(this).executionErrorsButton.addEventHandler('click', this.executionErrorsFilter, this);

            _(this).tooltip = new Tooltip({
                parent: _(this).settingsButton,
                contentText: dictionary.get('jobTable.settings')
            });

            _(this).tooltipFilters = new Tooltip({
                parent: _(this).filtersButton,
                contentText: dictionary.get('jobFilters.filters')
            });

            // TODO prefetch all ids in the beginning.
            // TODO see(https://confluence-nam.lmera.ericsson.se/display/RSS/%5BSpike%5D+Table+Pagination)

            _(this).dataService.setMyJobsFilterFlag(_(this).myJobsFilterButton.getNative().className.indexOf('ebBtn_active') !== -1);

            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.redrawTable.bind(this));
            _(this).tableSettings.addEventHandler('tablesettings:updateColumns', onUpdateColumnsRequested, this);

            this.refreshAll = setInterval(function() { this.refreshPeriodically(); }.bind(this), 20000);
            this.view.hideFilterInlineError();
            this.filterUpdate();

            //save table settings
            fetchTableSettings.call(this);

            //Fast refreshing is currently blocked, but can be unblocked by uncommenting the line below.
            //this.refresher = setInterval(function() { this.updateActiveJobs(); }.bind(this), 1000);

            // Set dateTime filters from flyout panel
            Container.getEventBus().subscribe('jobFilters:change', function(filters) {
                _(this).dataService.setCreatedFrom(filters.dateTimeRange.from);
                _(this).dataService.setCreatedTo(filters.dateTimeRange.to);
                this.reloadTable(true);
            }.bind(this));
        },

        onDestroy: function() {
            core.Window.removeEventHandler('resize', this.windowResizeEvtId);
            //clearInterval(this.refresher);
            clearInterval(this.refreshAll);
        },

        hashChange: function() {
            if (this.checkIfIsMainView()) { //app is going back to main page
                this.reloadTable(true);
            }
        },

        redrawTable: function() {
            this.getElement().setStyle(
                {height: (core.Window.getProperty('innerHeight') - this.getElement().getPosition().top - 3) + 'px'}
            );
            if (_(this).table) {
                _(this).table.redraw();
            }
        },

        checkIfIsMainView: function() {
            return window.location.hash === '#bulkconfiguration';
        },

        dataServiceObserver: function(message) {
            if (message.jobsTotalCount) {
                _(this).totalRows = message.jobsTotalCount;
                _(this).table.setTotalRows(message.jobsTotalCount);
                this.view.setTotalRows(message.jobsTotalCount);
            }
            if (message.noJobs) {
                this.showInfoDashboard();
            } else {
                if (this.infoDashboard) {
                    this.hideInfoDashboard();
                }
            }
            if (message.errors) {
                this.showErrorDashboard(message.errors);
            } else {
                if (this.errorDashboard) {
                    this.hideErrorDashboard();
                }
            }
        },

        getTablePosition: function() {
            return _(this).table.getPosition();
        },

        getTableUnitsPerPage: function() {
            return _(this).table.getUnitsPerPage();
        },

        getCurrentJobs: function() {
            return _(this).dataService.getCurrentJobs();
        },

        activeJobs: {}, // {jobId: currentTime}

        updateActiveJobs: function() {
            if (this.checkIfIsMainView()) {
                var currentTime = new Date().getTime(),
                    lastValidTime = currentTime - 10000,
                    tableElementsBegin = this.getTablePosition(),
                    tableElementsEnd = tableElementsBegin + this.getTableUnitsPerPage(),
                    jobs = this.getCurrentJobs().data,
                    job;
                if (!jobs || !jobs.length) {
                    return;
                }
                if (tableElementsEnd > jobs.length - 1) {
                    tableElementsEnd = jobs.length - 1;
                }
                for (var idx = tableElementsBegin; idx <= tableElementsEnd; idx++) {
                    job = jobs[idx];
                    if (typeof job === 'object' &&
                        ((job.status === 'CREATED' && job.id === this.lastCreatedJobId) ||
                        job.status.substr(-3) === 'ING')) {
                        //PARSING, VALIDATING, EXECUTING
                        if (!this.activeJobs[job.id] || (this.activeJobs[job.id] && this.activeJobs[job.id] < lastValidTime)) {
                            this.activeJobs[job.id] = currentTime;
                            _(this).dataService.retrieveJobById(job.id).then(function(updatedJob) {
                                delete this.activeJobs[updatedJob.id];
                                this.doTableRedraw = true;
                            }.bind(this));
                        }
                    }
                }
                if (this.doTableRedraw === true) {
                    _(this).table.redraw();
                    this.doTableRedraw = false;
                }
            }
        },

        updateColumns: function(columns) {
            var selectedIds = _(this).table.getSelectedIds(), columnList = [], data;
            columns.forEach(function(entry) {
                if (entry.title === dictionary.jobTable.columnName.validError) {
                    entry.cellType = AlertCell;
                }
                if (entry.title === dictionary.jobTable.columnName.execErrors) {
                    entry.cellType = AlertCell;
                }
                columnList.push(entry);
            });
            data = {
                value: JSON.stringify(columnList),
                id: 'table-settings'
            };
            _(this).dataService.saveTableSettings(data);
            _(this).table.destroy();
            _(this).table = createJobsTable.call(this, _(this).totalRows, columnList);
            _(this).table.addSelectedIds(selectedIds);
            this.redrawTable();
            _(this).table.attachTo(this.view.getTableHolder());
            _(this).dataService.hideLoader();
        },

        showErrorDashboard: function(error) {
            var header = dictionary.errors.service_unavailable.title;
            var description;
            var errorCode;
            var status;
            try {
                errorCode = error.data.errorCode;
                status = error.xhr.getStatus();
            } catch (err) {
                // do nothing...
            }

            if (errorCode === -1) {
                description = '';
            } else if (status >= 500) {
                description = error.data.errors[0].message;
            } else {
                var messages;
                try { // try to find custom messages for given error code
                    messages = dictionary.errors[error.data.errors[0].code];
                }
                catch (err) {
                    // do nothing...
                }
                if (!messages) {
                    messages = dictionary.errors.default;

                    try { // try to add message from server response if available
                        messages.body = error.data.errors[0].message;
                    }
                    catch (err2) {
                        // do nothing...
                    }
                }
                header = messages.title;
                description = messages.body;
            }
            if (this.infoDashboard !== null) {
                this.hideInfoDashboard();
            }
            if (this.errorDashboard !== null) {
                this.errorDashboard.destroy();
            }

            this.view.getTableHolder().setStyle('display', 'none');
            this.view.getActionPanelHolder().setStyle('display', 'none');

            this.errorDashboard = new InlineMessage({
                header: header,
                description: description,
                icon: 'error'
            });
            this.view.getErrorMessageArea().removeStyle('display');
            this.errorDashboard.attachTo(this.view.getErrorMessageArea());
        },

        hideErrorDashboard: function() {
            this.errorDashboard.destroy();
            this.errorDashboard = null;
            this.view.getActionPanelHolder().removeStyle('display');
            this.view.getTableHolder().removeStyle('display');
        },

        showInfoDashboard: function() {
            var msg = dictionary.jobTable.noJobsMsg;
            var title = (_(this).dataService.checkFilters()) ? msg.withFilters.title : msg.notCreated.title;
            var body = (_(this).dataService.checkFilters()) ? msg.withFilters.body : msg.notCreated.body;

            if (this.errorDashboard !== null) {
                this.hideErrorDashboard();
            }

            if (this.infoDashboard !== null) {
                this.infoDashboard.destroy();
            }

            this.view.getTableHolder().setStyle('display', 'none');

            this.infoDashboard = new InlineMessage({
                header: title,
                description: body
            });

            this.view.getErrorMessageArea().removeStyle('display');
            this.infoDashboard.attachTo(this.view.getErrorMessageArea());
        },

        hideInfoDashboard: function() {
            this.infoDashboard.destroy();
            this.infoDashboard = null;
            this.view.getTableHolder().removeStyle('display');
        },

        loadJobs: function(doRefresh) {
            _(this).dataService.fetchJobs(0)
                .then(function(data) {
                    if (this.processTotalRows(data) && doRefresh && _(this).table) {
                        _(this).table.setPosition(0);
                        _(this).table.redraw();
                    }
                }.bind(this))
                .catch(function(error) {
                    console.log(error);
                });
        },

        processTotalRows: function(data) {
            if (typeof data === 'number') { // proper response with number of rows
                if (this.errorDashboard) {
                    this.hideErrorDashboard();
                }
                return true;
            }
            // else error
            _(this).totalRows = 0;
            _(this).table.setTotalRows(0);
            this.view.setTotalRows(0);
            if (typeof data === 'object') {
                this.showErrorDashboard(data.error);
            }
            return false;
        },

        refreshTable: function(lastCreatedJobId) {
            this.lastCreatedJobId = lastCreatedJobId;
            _(this).dataService.clearJobs();
            this.loadJobs(true);
        },

        refreshPeriodically: function() {
            //Do refresh only when the app is in main view
            if (this.checkIfIsMainView()) {
                _(this).dataService.clearJobs();
                _(this).dataService.fetchJobs(_(this).table.getPosition())
                    .then(function(data) {
                        if (this.processTotalRows(data) && this.view.getFilterArea().getValue() === '') {
                            _(this).table.redraw();
                        } else {
                            // filterByJobNameAndId.call(this);
                        }
                    }.bind(this))
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        },

        /**
         *  Clears all filters, resets buttons, and hides 'Clear' link.
         */
        clearFilters: function() {
            var classList;

            //Clear MyJobs filter
            _(this).dataService.setMyJobsFilterFlag(false);
            classList = _(this).myJobsFilterButton.getNative().classList;
            if (classList.contains('ebBtn_active')) {
                classList.toggle('ebBtn_active');
            }

            //Clear ValidationErrors filter
            _(this).dataService.setValidationErrorsFilterFlag(false);
            this.view.getValidationErrorsButton().getNative().checked = false;

            //Clear ExecutionErrors filter
            _(this).dataService.setExecutionErrorsFilterFlag(false);
            this.view.getExecutionErrorsButton().getNative().checked = false;

            //Clear Input filter
            _(this).dataService.setFilterID('');
            _(this).dataService.setFilterName('');
            _(this).dataService.setFilterEmpty(true);
            this.view.getFilterArea().setValue('');

            //Clear flyOut panel filters
            _(this).jobFilters.clearAllFilters();
            _(this).dataService.setCreatedFrom(null);
            _(this).dataService.setCreatedTo(null);

            //Hide link and reload table
            this.reloadTable(true);
            this.view.hideFilterSelection();
        },

        /**
         * Shows 'Clear' filter option when filters are in use.
         */
        filterUpdate: function() {
            var filters = _(this).dataService.getFilters();

            if (filters.executionErrors === true ||
                filters.validationErrors === true ||
                filters.myJobs === true ||
                filters.filterName ||
                filters.filterID ||
                filters.createdFrom ||
                filters.createdTo
            ) {
                this.view.showFilterSelection();
            }
            else {
                this.view.hideFilterSelection();
            }
        },

        myJobsFilter: function() {
            var classList = _(this).myJobsFilterButton.getNative().classList;
            classList.toggle('ebBtn_active');
            _(this).dataService.setMyJobsFilterFlag(classList.contains('ebBtn_active'));
            this.reloadTable(true);
        },

        validationErrorsFilter: function() {
            _(this).dataService.setValidationErrorsFilterFlag(this.view.getValidationErrorsButton().getNative().checked);
            this.reloadTable(true);
        },

        executionErrorsFilter: function() {
            _(this).dataService.setExecutionErrorsFilterFlag(this.view.getExecutionErrorsButton().getNative().checked);
            this.reloadTable(true);
        },

        reloadTable: function(filterEnabled) {
            _(this).dataService.showLoader();
            _(this).table.showLoader();
            _(this).dataService.fetchJobs(0)
                .then(function(data) {
                    _(this).dataService.clearJobs();
                    if (this.processTotalRows(data)) {
                        _(this).table.redraw();
                    }
                    //Enable the filter clear after table has updated
                    if (filterEnabled) {
                        this.filterUpdate();
                    }
                }.bind(this))
                .catch(function(error) {
                    console.log(error);
                });
        }
    });

    function filterByJobNameAndId() {
        _(this).dataService.setFilterID('');
        _(this).dataService.setFilterName('');
        _(this).dataService.setFilterEmpty(false);
        clearTimeout(delayTimer);
        delayTimer = setTimeout(function() {
            var inputValue = this.view.getFilterArea().getValue();
            if (this.view.showFilterInlineError) {
                this.view.hideFilterInlineError();
            }
            if (inputValue === '*') {
                this.view.showFilterInlineError();
            } else {
                if (inputValue !== '') {
                    if (inputValue.includes('*')) {
                        var url = inputValue.endsWith('*') ? inputValue : inputValue + '*';
                        _(this).dataService.setFilterName(url);
                    } else {
                        _(this).dataService.setFilterID(inputValue);
                    }
                } else {
                    _(this).dataService.setFilterEmpty(true);
                }
                this.reloadTable(true);
            }
        }.bind(this), 500);
    }

    function createJobsTable(totalRows, columns) {
        var table = new Table({
            getIds: _(this).dataService.getIds.bind(_(this).dataService),
            getAllIds: _(this).dataService.getAllIds.bind(_(this).dataService),
            getData: _(this).dataService.getJobs.bind(_(this).dataService),
            totalRows: totalRows,
            columns: columns
        });

        table.addEventHandler('virtualtable:selected', function(data) {
            this.trigger('jobstable:selected', data);
        }.bind(this));
        return table;
    }

    function mapToColumnDefinitions(column) {
        return {
            name: column.title,
            value: column.attribute,
            width: column.width,
            resizable: column.resizable,
            visible: column.visible,
            sortable: column.sortable,
            cellType: column.cellType,
            bgColor: column.bgColor,
            pinned: column.pinned
        };
    }

    function onUpdateColumnsRequested(columns) {
        this.updateColumns(columns);
        Container.getEventBus().publish('flyout:hide');
    }

    function showTableSettings() {
        Container.getEventBus().publish('flyout:show', {
            header: dictionary.get('jobTable.tableSettings'),
            content: _(this).tableSettings
        });
    }

    function showJobFilters() {
        Container.getEventBus().publish('flyout:show', {
            header: dictionary.get('jobFilters.filters'),
            content: _(this).jobFilters
        });
    }

    function fetchTableSettings() {
        _(this).dataService.fetchTableSettings()
            .then(function(data) {
                if (typeof data !== 'undefined') {
                    this.updateColumns(JSON.parse(data.value));
                    _(this).tableSettings = new TableSetting({
                        columns: JSON.parse(data.value).map(mapToColumnDefinitions)
                    });
                    _(this).tableSettings.addEventHandler('tablesettings:updateColumns', onUpdateColumnsRequested, this);
                }
            }.bind(this))
            .catch(function(error) {
                console.log(error);
            });
    }

});
