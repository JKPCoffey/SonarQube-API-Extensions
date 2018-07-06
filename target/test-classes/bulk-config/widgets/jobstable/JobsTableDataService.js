define([
    'i18n/AdvancedDateTime',
    'jscore/ext/privateStore',
    'bulkimportlib/utils/AssocArray',
    'bulkimportlib/services/BulkConfigurationApi'
], function(AdvancedDateTime, PrivateStore, AssocArray, BulkConfigurationApi) {

    var _ = PrivateStore.create();
    var JOBS_PER_REQUEST = 50;
    var loaderOverlayHidden = false;
    var myJobsFilterFlag = null;
    var filterName = null;
    var filterID = null;
    var emptyFilterFlag = true;
    var validationErrorsFilterFlag = null;
    var executionErrorsFilterFlag = null;
    var createdFrom = null;
    var createdTo = null;

    var DataService = function() {
        // ordered array
        _(this).jobs = new AssocArray();
        _(this).delayFetchId = null;
        _(this).currentUserName = null;
    };

    DataService.prototype.clearJobs = function() {
        _(this).jobs.clear();
    };

    /**
     * fetch jobs from services and save in memory
     * @param index
     * @returns {Promise<Integer>} total number of rows
     */
    DataService.prototype.fetchJobs = function(index) {
        var urlParameters = {
            offset: index,
            limit: JOBS_PER_REQUEST,
            expand: ['files','summary','failures']
        };

        if (!emptyFilterFlag) {
            if (filterName) {
                urlParameters.name = filterName;
            }
            if (filterID) {
                urlParameters.search = filterID;
            }
        }

        if (createdFrom) {
            urlParameters.createdFrom = createdFrom.toISOString();
        }
        if (createdTo) {
            urlParameters.createdTo = createdTo.toISOString();
        }

        var hasErrors = [];
        if (validationErrorsFilterFlag) {
            hasErrors.push('invalid');
        }
        if (executionErrorsFilterFlag) {
            hasErrors.push('execution_error');
        }
        if (hasErrors.length) {
            urlParameters.hasErrors = hasErrors;
        }

        if (myJobsFilterFlag) {
            if (_(this).currentUserName !== null) {
                urlParameters.createdBy = _(this).currentUserName;
                return this.mapJobs(urlParameters, index);
            }
            else {
                return BulkConfigurationApi.getUser().then(function(profile) {
                    _(this).currentUserName = urlParameters.createdBy = profile.data.username;
                    return this.mapJobs(urlParameters, index);
                }.bind(this));
            }
        }
        else {
            return this.mapJobs(urlParameters, index);
        }
    };

    /**
     * callback called by tablelib to display rows in the viewport
     * if in memory just return it, otherwise fetch it from services
     * @param index
     * @param length
     * @returns {*}
     */
    DataService.prototype.getJobs = function(index, length) {
        // check if there is any row in the viewport not in memory
        var notInMemoryFrom = null;
        for (var i = index; i < index + length; i++) {
            if (!_(this).jobs.getByIndex(i)) {
                notInMemoryFrom = i;
                break;
            }
        }

        // stop previous interval if it was not started yet
        clearInterval(_(this).delayFetchId);
        // if not in memory fetch from services
        if (notInMemoryFrom !== null) {
            return new Promise(function(resolve, reject) {
                // delay start of request so if user keep scrolling clearInterval above won't allow it to start
                _(this).delayFetchId = setTimeout(function() {
                    this.fetchJobs(notInMemoryFrom)
                        .then(function() {
                            resolve(_(this).jobs.getAll().slice().splice(index, length));
                            // Hide loader after initial load of table
                            if (!loaderOverlayHidden) {
                                this.hideLoader();
                            }
                        }.bind(this))
                        .catch(reject);
                }.bind(this), 750);
            }.bind(this));
        }

        return Promise.resolve(_(this).jobs.getAll().slice().splice(index, length), this.hideLoader());
    };

    /**
     * Hides loader overlay on table if it is not hidden.
     */
    DataService.prototype.hideLoaderAttemptsCount = 0;
    DataService.prototype.hideLoader = function() {
        var loaderOverlay = document.querySelector('.elTablelib-VirtualScrolling-loader-overlay');
        if (loaderOverlay === null) {
            if (this.hideLoaderAttemptsCount > 50) {
                this.hideLoaderAttemptsCount = 0;
                return;
            }
            setTimeout(function() {
                this.hideLoaderAttemptsCount++;
                this.hideLoader();
            }.bind(this), 1);
        }
        else {
            loaderOverlay.style.opacity = '0';
            loaderOverlay.style.pointerEvents = 'none';
            loaderOverlayHidden = true;
            this.hideLoaderAttemptsCount = 0;
        }
    };

    /**
     * Shows loader overlay on table if it is hidden.
     */
    DataService.prototype.showLoader = function() {
        var loaderOverlay = document.querySelector('.elTablelib-VirtualScrolling-loader-overlay');
        if (loaderOverlay !== null) {
            loaderOverlay.style.opacity = '0.8';
            loaderOverlay.style.pointerEvents = 'initial';
            loaderOverlayHidden = false;
        }
    };

    /**
     * returns ids between the selection (shift + click)
     * assuming all ids were already pre-fetched
     * @param a
     * @param b
     * @returns {Promise<Integer>} ids
     */
    DataService.prototype.getIds = function(a, b) {
        var aBeforeB = a < b;
        var start = aBeforeB ? a : b;
        var end = aBeforeB ? b : a;
        var ids = _(this).jobs.getAll()
            .filter(function(job) {
                return job.id >= start && job.id <= end;
            })
            .map(function(job) {
                return job.id;
            });
        return Promise.resolve(ids);
    };

    /**
     * returns all ids
     * assuming all ids were already pre-fetched
     * @returns {Promise<Integer>} ids
     */
    DataService.prototype.getAllIds = function() {
        return Promise.resolve(_(this).jobs.getAll().map(function(job) {
            return job.id;
        }));
    };

    /**
     * Set the flag of myJobsFilter
     * @param isOn
     */
    DataService.prototype.setMyJobsFilterFlag = function(isOn) {
        if (isOn !== null) {
            myJobsFilterFlag = isOn;
        } else {
            var myJobsFilterButton = document.querySelector('.elBulkImportLib-wJobsTable-actionPanel-right-filters-myJobs');
            if (myJobsFilterButton !== null) {
                myJobsFilterFlag = myJobsFilterButton.classList.contains('ebBtn_active');
            }
        }
    };

    /**
     * Set the flag of validationErrorsFilter
     * @param isOn
     */
    DataService.prototype.setValidationErrorsFilterFlag = function(isOn) {
        validationErrorsFilterFlag = isOn;
    };

    /**
     * Set the flag of executionErrorsFilter
     * @param isOn
     */
    DataService.prototype.setExecutionErrorsFilterFlag = function(isOn) {
        executionErrorsFilterFlag = isOn;
    };

    /**
     * returns all jobs stored in memory
     * @returns {AssocArray} jobs
     */
    DataService.prototype.getCurrentJobs = function() {
        return _(this).jobs;
    };

    /**
     * returns job selected by ID
     * @param {int} jobId
     * @returns {Object} job
     */
    DataService.prototype.retrieveJobById = function(jobId) {
        return BulkConfigurationApi.retrieveJobById(jobId, ['files','summary','failures']).then(
            function(job) {
                _(this).jobs.data[_(this).jobs.index[job.data.id]] = mapJob(job.data);
                return Promise.resolve(job.data);
            }.bind(this),
            function(err) {
                return Promise.reject(err);
            }
        );
    };

    DataService.prototype.saveTableSettings = function(data) {
        return BulkConfigurationApi.saveTableSettings(data).then(function() {
            return Promise.resolve();
        }.bind(this));
    };

    DataService.prototype.fetchTableSettings = function() {
        return BulkConfigurationApi.fetchTableSettings().then(function(column) {
            return column.data[0];
        }.bind(this));
    };

    /**
     * returns an object with the current keys and values of all filters
     * @returns {{myJobs: *, validationErrors: *, executionErrors: *, filterID: *, filterName: *, emptyFilterFlag: *}}
     */
    DataService.prototype.getFilters = function() {
        var filters = {
            validationErrors: validationErrorsFilterFlag,
            executionErrors: executionErrorsFilterFlag,
            emptyFilterFlag: emptyFilterFlag,
            myJobs: myJobsFilterFlag,
            filterName: filterName,
            filterID: filterID,
            createdFrom: createdFrom,
            createdTo: createdTo
        };
        return filters;
    };

    DataService.prototype.setFilterName = function(val) {
        filterName = val;
    };

    DataService.prototype.setFilterID = function(val) {
        filterID = val;
    };

    DataService.prototype.setFilterEmpty = function(val) {
        emptyFilterFlag = val;
    };

    DataService.prototype.setCreatedFrom = function(val) {
        createdFrom = val;
    };

    DataService.prototype.setCreatedTo = function(val) {
        createdTo = val;
    };

    /**
     *
     * @param urlParameters
     * @param index
     * @returns totalCount
     */
    DataService.prototype.mapJobs = function(urlParameters, index) {
        return BulkConfigurationApi
            .getJobs(urlParameters)
            .then(
                function(response) {
                    // add jobs to memory
                    if (!response.data) {
                        if (urlParameters.offset === 0) {
                            this.notifyObservers({noJobs: true});
                        }
                        return;
                    }
                    //console.log(response.data.jobs);
                    response.data.jobs
                        .map(mapJob)
                        .forEach(function(job, i) {
                            //if file is read but has no parse-able content, set 'File Errors' to 1
                            if (job.parsed === 0 && job.executed === 0 && job.valid === 0) {
                                job.failures = 1;
                            }
                            // save data to memory
                            _(this).jobs.add(job.id, job, index + i);
                        }.bind(this));
                    this.notifyObservers({jobsTotalCount: response.data.totalCount});
                    return response.data.totalCount;
                }.bind(this),
                function(error) {
                    this.notifyObservers({errors: error});
                    return { error: error };
                }.bind(this)
            );
    };

    DataService.prototype.checkFilters = function() {
        return executionErrorsFilterFlag ||
                validationErrorsFilterFlag ||
                !emptyFilterFlag ||
                myJobsFilterFlag ||
                createdFrom ||
                createdTo;
    };

    /**
     * Basic Subject/Observers functionality
     */
    DataService.prototype.observers = [];
    DataService.prototype.addObserver = function(observer, context) {
        this.observers.push({observer: observer, context: context});
    };
    DataService.prototype.removeObserver = function(observer, context) {
        for (var i = this.observers.length - 1; i >= 0; i--) {
            if (this.observers[i].fn === observer &&  this.observers[i].context === context) {
                this.observers.splice(i, 1);
            }
        }
    };
    DataService.prototype.notifyObservers = function(message) {
        for (var i = this.observers.length - 1; i >= 0; i--) {
            this.observers[i].observer.call(this.observers[i].context, message);
        }
    };

    return DataService;

    function mapJob(job) {
        var flatJob = {
            name: job.name || '-',
            id: job.id,
            status: job.status,
            executionStarted: job.executionStarted ?
                AdvancedDateTime(new Date(job.executionStarted)).mode('international').utc().format('DTS') : '-',
            executionFinished: job.lastExecution ?
                AdvancedDateTime(new Date(job.lastExecution)).mode('international').utc().format('DTS') : '-',
            validationStarted: job.validationStarted ?
                AdvancedDateTime(new Date(job.validationStarted)).mode('international').utc().format('DTS') : '-',
            validationFinished: job.lastValidation ?
                AdvancedDateTime(new Date(job.lastValidation)).mode('international').utc().format('DTS') : '-',
            created: AdvancedDateTime(new Date(job.created)).mode('international').utc().format('DTS'),
            userId: job.userId || '-',
            parsed: 0,
            valid: 0,
            invalid: 0,
            succesExecuted: 0,
            executionErrors: 0,
            failures: 0,
            fileName: ''
        };
        if (job.summary && job.summary.total) {
            flatJob.parsed = job.summary.total.parsed;
            flatJob.valid = job.summary.total.valid;
            flatJob.invalid = job.summary.total.invalid;
            flatJob.succesExecuted = job.summary.total.executed;
            flatJob.executionErrors = job.summary.total.executionErrors;
        }
        if (job.failures) {
            flatJob.failures = job.failures.length;
        }
        if (job.files && job.files[0] && job.files[0].name) {
            flatJob.fileName = job.files[0].name;
        }

        if (job.executionPolicy) {
            flatJob.executionPolicy = job.executionPolicy;
        }
        if (job.validationPolicy) {
            flatJob.validationPolicy = job.validationPolicy;
        }
        flatJob.executed = flatJob.succesExecuted + flatJob.executionErrors;
        return flatJob;
    }

});
