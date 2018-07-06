define([
    'jscore/ext/net'
], function(net) {
    return {
        /**
         *
         * -1 = unknown server error (when response is not json format)
         * -2 = request timed out by browser
         * @param options
         * @returns {Promise}
         */
        ajax: function ajax(options) {
            options = options || {};
            return new Promise(function(resolve, reject) {
                options.success = function(data, xhr) {
                    this.xhr = null;
                    resolve({data: data, xhr: xhr});
                };

                options.error = function(data, xhr) {
                    // overwrite data with response body because jscore net component send different data for errors
                    try {
                        data = xhr.getResponseJSON();
                    } catch (e) {
                        data = {errorCode: -1};
                    }

                    this.xhr = null;
                    reject({data: data, xhr: xhr});
                };

                options.onTimeout = function(xhr) {
                    this.xhr = null;
                    var data = {errorCode: -2};
                    reject({data: data, xhr: xhr});
                }.bind(this);

                this.xhr = net.ajax(options);
            }.bind(this));
        }

    };
});
