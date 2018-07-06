define([
    './net'
], function(net) {
    var baseUrl = 'bulk-configuration/v1/import-jobs';

    return {
        getJobs: function(props) {
            props = props || {};
            props.offset = props.offset || 0;

            var url = baseUrl + '/jobs/' + this.params(props);

            return net.ajax({
                url: url,
                type: 'GET',
                dataType: 'json'
            });
        },

        getUser: function() {
            var url = baseUrl + '/editprofile';
            return net.ajax({
                url: url,
                type: 'GET',
                dataType: 'json'
            });
        },

        createNewJob: function(jobData) {
            return net.ajax({
                url: baseUrl + '/jobs',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(jobData)
            });
        },

        retrieveJobById: function(jobId, props) {
            var requestParams = '';
            if (props) {
                requestParams = this.params({expand: [props]});
            }
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/' + requestParams,
                type: 'GET',
                dataType: 'json'
            });
        },

        filterByValidationErrors: false,

        filterByExecutionErrors: false,

        retrieveOperationInfo: function(jobId, props, offset, limit) {
            var params = {offset: offset, limit: limit, expand: [props]};
            var status = [];
            if (this.filterByValidationErrors) {
                status.push('invalid');
            }
            if (this.filterByExecutionErrors) {
                status.push('execution-error');
            }
            if (status.length) {
                params.status = status;
            }
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/operations/' + this.params(params),
                type: 'GET',
                dataType: 'json'
            });
        },

        uploadJobFile: function(jobId, jobFile) {
            var data = new FormData();
            data.append('file', jobFile);
            data.append('filename', jobFile.name);

            var currentJobUpload = net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/files',
                type: 'POST',
                headers: {cacheControl: 'no-cache'},
                contentType: false,
                processData: false,
                data: data
            });
            this.uploadJobFileXHR = net.xhr;

            return currentJobUpload;
        },

        executeJobFile: function(jobId, jobData) {
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/invocations',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(jobData)
            });
        },

        reExecuteJobFile: function(jobId, jobData) {
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/executions',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(jobData)
            });
        },

        getFileFormat: function(jobId) {
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId + '/?expand=files',
                type: 'GET',
                dataType: 'json'
            });
        },

        startRevocationJob: function(jobId,fileFormat) {
            return net.ajax({
                url: 'configuration/jobs',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    "type": "UNDO_IMPORT_TO_LIVE",
                    "id": jobId,
                    "fileFormat": fileFormat
                })
            });
        },

        getRevocationJobStatus: function(revocationJobId) {
          return net.ajax({
              url : 'configuration/jobs/' + revocationJobId + '?type=UNDO_IMPORT_TO_LIVE',
              type : 'GET',
              dataType : 'json'
          });
        },

        downloadRevocationJobFile: function(filePath){
            return net.ajax({
                url : filePath,
                type : 'GET'
            });
        },

        cancelJobExecution: function(jobId) {
            return net.ajax({
                url: baseUrl + '/jobs/' + jobId,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({jobId: jobId, status: 'cancelling'})
            });
        },

        saveTableSettings: function(data) {
            return net.ajax({
                url: 'rest/ui/settings/bulkconfiguration/tableSettings',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        },

        fetchTableSettings: function() {
            return net.ajax({
                url: 'rest/ui/settings/bulkconfiguration/tableSettings?id=table-settings',
                type: 'GET',
                dataType: 'json'
            });
        },

        /**
         * converts object to querystring
         * @method params
         * @private
         * @param props
         * @return {string}
         */
        params: params
    };

    function params(props, prefix, hideQuestionMark) {
        var keys = Object.keys(props || {});
        var qs = hideQuestionMark ? '' : '?';

        if (keys.length === 0) {
            return '';
        }

        return qs + keys
            .map(function(key) {
                var value = props[key];
                var k = prefix ? prefix + '[' + encodeURIComponent(key) + ']' : encodeURIComponent(key);

                if (Array.isArray(value)) {
                    return value.map(function(v) {
                        var p = {};
                        p[key] = v;
                        return params(p, undefined, true);
                    }).join('&');
                } else if (typeof value === 'object') {
                    return params(value, key, true);
                }
                return [k, encodeURIComponent(value)].join('=');
            })
            .join('&');
    }

});
