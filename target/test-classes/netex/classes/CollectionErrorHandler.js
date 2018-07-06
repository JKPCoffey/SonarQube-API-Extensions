define([
    'i18n!networkexplorerlib/collectionerrorhandler.json'
], function (strings) {

    /**
     * Return error message based on error cases
     *
     * @class CollectionErrorHandler
     */

    return {

        /**
         * Don't use failure reason mapper object in locales for exporting failed objects.
         * Exported file should only contain English characters.
         */
        FAILURE_REASON_MAPPER: {
            "duplicated": "Duplicated object",
            "invalid": "Object not found"
        },

        /**
         *   Get error message after unsuccessful request to server.
         *
         *   @method getErrorMessage
         *   @param {Object} xhr response from server
         *   @return{String} errorMessage
         */
        getErrorMessage: function(xhr) {
            var errorMessage;
            try {
                errorMessage = strings.get('internalErrorCodesMapper')[xhr.getResponseJSON().internalErrorCode.toString()];
            }
            catch (e) {
                /* skip */
            }
            errorMessage = errorMessage || strings.get('httpErrorCodesMapper')[xhr.getStatus().toString()];
            errorMessage = errorMessage || strings.get('httpErrorCodesMapper')["500"];

            return errorMessage;
        },

        /**
         *   Checks if the error is of type "Non-Existent Collection".
         *
         *   @method isErrorOfTypeNonExistentCollection
         *   @param {Object} xhr response from server
         *   @return{Boolean} true if error is of type "Non-Existent Collection", false otherwise
         */
        isErrorOfTypeNonExistentCollection: function (xhr) {
            try {
                return xhr.getResponseJSON().internalErrorCode === 10007; //true if collection does not exist.
            } catch (e) {
                // xhr contained html instead of json.
                return false; //collection may exist but we cannot access it because service vm is offline.
            }
            return false; //false if a different error code was returned by the service.
        },

        /**
         *   Gets a message containing the description of the reason for a failure occurred
         *   when trying to add an object to a collection.
         *
         *   @method getFailureReasonDetails
         *   @param {String} failure from server
         *   @return{String} description of failure reason
         */
        getFailureReasonDetails: function(failureReason) {
            var failureReasonDetails = this.FAILURE_REASON_MAPPER[failureReason];
            return failureReasonDetails || this.FAILURE_REASON_MAPPER.invalid;
        }
    };
});
