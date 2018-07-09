define([
    'i18n!networkexplorerlib/Results.json'
], function (strings) {

    /**
     * ErrorHandler
     * -----
     * Return error message based on error cases
     *
     * @constructor
     */
    var ErrorHandler = function () {};

    ErrorHandler.prototype = {
        /**
         *   Return appropriate error body based on error status code.
         *
         *   @method getErrorContext
         *   @param {Object} xhr response from server
         *   @return{Object} errorBody
         */
        getErrorContext: function (xhr) {
            var errorBody;
            switch (xhr.getStatus()) {
                case 0:
                    errorBody = {
                        userMessage: {
                            title: strings.get('noConnectionMessageHeader'),
                            body: strings.get('noConnectionMessageBody')
                        }
                    };
                    break;
                case 401:
                    errorBody = {
                        userMessage: {
                            title: strings.get('unauthorizedAccessErrorHeader'),
                            body: strings.get('unauthorizedAccessErrorParagraph')
                        }
                    };
                    break;
                case 503:
                    errorBody = {
                        userMessage: {
                            title: strings.get('serverTimeout503Header'),
                            body: strings.get('serverTimeout503Body')
                        }
                    };
                    break;
                case 504:
                    errorBody = {
                        userMessage: {
                            title: strings.get('serverTimeout504Header'),
                            body: strings.get('serverTimeout504Body')
                        }
                    };
                    break;
                // Default will catch 404, 500 and unknowns
                default:
                    errorBody = {
                        userMessage: {
                            title: strings.get('unknownServerErrorHeader'),
                            body: strings.get('unknownServerErrorParagraph')
                        }
                    };
            }
            return errorBody;
        },

        /**
         *   Get error message after unsuccessful attempt to connect to server.
         *
         *   @method getErrorMessage
         *   @param {Object} xhr response from server
         *   @return{Object} errorMessage
         */
        getErrorMessage: function(xhr) {
            var errorMessage;
            if (xhr.getStatusText() !== 'abort') {
                try {
                    errorMessage = JSON.parse(xhr.getResponseText());
                } catch (e) {
                    errorMessage = this.getErrorContext(xhr);
                }
            }
            return errorMessage;
        }
    };

    return ErrorHandler;
});
