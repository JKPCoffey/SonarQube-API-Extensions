define([
    'jscore/ext/net'
], function (
    net
) {
    var RequestQueue = function () {
        this.queue = [];
        this.xhrs = [];
        this._interruptId = setInterval(function() {
            if (this.delay > 200) {
                this.delay -= 100;
            }
        }.bind(this), 400);
    };

    RequestQueue.prototype = {

        delay: 200,

        /**
         * Add requests to the queue.
         *
         * @param {Array} requests An array of request options for net.ajax to consume
         */
        add: function(requests){
            this.queue = this.queue.concat(requests);
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(this.flush.bind(this), this.delay);
        },

        /**
         * Cancel all outstanding and sent requests.
         *
         * @return {Array} all unprocessed request options objects
         */
        cancelAll: function() {
            clearTimeout(this.timeoutId);
            var tmpQueue = this.queue;
            this.queue = [];
            while(this.xhrs.length > 0) { // cancel created requests
                this.xhrs.shift().abort();
            }
            return tmpQueue;
        },

        /**
         * Flush
         */
        flush: function(){
            if (this.queue.length > 0) {
                this.delay += 200;
                // FIFO
                this.xhrs.push(net.ajax(this.queue.shift()));
            }
            this.timeoutId = setTimeout(this.flush.bind(this), this.delay);
        },

        /**
         * Cleanup
         */
        destroy: function() {
            clearInterval(this._interruptId);
        }
    };

    return RequestQueue;
});