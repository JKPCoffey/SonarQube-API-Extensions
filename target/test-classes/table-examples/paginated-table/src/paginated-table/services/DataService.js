/*global define*/
define([
    'example-lib/utils/MockData'
], function (mockData) {
    'use strict';

    var data = mockData.generate({
        rows: 50000,
        attributes: {
            id: 'id',
            firstName: 'firstName',
            lastName: 'lastName',
            role: 'role'
        }
    });

    return {
        getData: function (options) {
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
            // arr.slice([begin[, end]])

            var offset = options.offset,
                limit = options.limit,
                responseData = data.slice(offset, offset + limit);

            // simulate network latency
            setTimeout(function () {
                options.success({
                    data: responseData,
                    length: data.length
                });
            }, 1000);
        }
    };
});
