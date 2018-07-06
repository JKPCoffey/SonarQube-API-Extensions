define(function () {
    return {
        /**
         * Creates an array of arrays with maximum size of chunkSize from an existing array
         *
         * @param {Array} arrayToChunk an array of objects
         * @param {Number} chunkSize A positive integer greater than 0
         * @return{Array|undefined} array of arrays with maximum size of chunkSize
         */
        chunk: function(arrayToChunk, chunkSize) {
            if (!arrayToChunk||!(arrayToChunk instanceof Array)||!isFinite(chunkSize)||chunkSize < 1) {
                return undefined;
            }
            var result = [];
            for (var i=0,len=arrayToChunk.length; i<len; i+=chunkSize) {
                result.push(arrayToChunk.slice(i,i+chunkSize));
            }
            return result;
        },
        /**
         * Creates an single array from an array of arrays
         *
         * @param {Array} arraysToUnchunk an array of arrays
         * @return{Array|undefined} array containing all elements of arraysToUnchunk 1 level deep
         */
        unchunk: function(arraysToUnchunk) {
            if (!arraysToUnchunk||!(arraysToUnchunk instanceof Array)) {
                return undefined;
            }
            return [].concat.apply([], arraysToUnchunk);
        },
        /**
         * Create an array without the items to be removed
         *
         * @param {Array} arraySource an array of objects
         * @param {Array} removeElements an array of objects to be removed
         * @return{Array|undefined} filtered array
         */
        remove: function(arraySource, removeElements) {
            if (!arraySource||!(arraySource instanceof Array)) {
                return undefined;
            }
            if (!removeElements||!(removeElements instanceof Array)) {
                return undefined;
            }
            return arraySource.filter(function(element){
                return removeElements.indexOf(element)===-1;
            });
        }
    };
});