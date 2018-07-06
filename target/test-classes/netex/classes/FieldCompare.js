define(function () {
    return {

        /**
         * Compare two fields by their string values, returns -1, 0 or 1 depending on alphabetic order
         * used by default for all field not containing a date value
         *
         * @method compareString
         * @param {String} a first value to be compared
         * @param {String} b second value to be compared
         * @return {Integer} -1, 0 or 1 depending on alphabetic order of passed strings
         */
        compareString: function(a, b) {
            var x = a.toString().toLowerCase();
            var y = b.toString().toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        },

        /**
         * Compare two date fields, returns -1, 0 or 1 depending on date values
         * invalid date values are forced as Number.MAX_VALUE, bigger than any valid date
         *
         * @method compareDate
         * @param {String} a first time stamp to be compared
         * @param {String} b second time stamp to be compared
         * @return {Integer} -1, 0 or 1 depending on time order of parameters
         */
        compareDate: function(a, b) {
            var x = new Date(a).getTime();
            var y = new Date(b).getTime();
            x = isNaN(x) ? Number.MAX_VALUE : x;
            y = isNaN(y) ? Number.MAX_VALUE : y;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        },
    };
});