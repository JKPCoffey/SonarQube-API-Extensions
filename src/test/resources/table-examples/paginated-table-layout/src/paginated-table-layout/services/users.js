/*global define, Promise, Array */
define([
    'jscore/ext/utils',
    'example-lib/utils/MockData'
], function (coreUtils, mockData) {
    'use strict';

    var data = mockData.generate({
            rows: 1000,
            attributes: {
                id: 'id',
                username: 'signum',
                status: 'boolean',
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role',  // roles defined below
                email: 'email',
                lastLogin: 'date'
            }
        }),
        dataTypes = {
            username: 'string',
            status: 'boolean',
            firstName: 'string',
            lastName: 'string',
            role: 'string',
            email: 'string',
            lastLogin: 'int'
        };

    /**
     * Simulation of the server side logic
     * @param request
     */
    function mockGet(request) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                var start = request.offset,
                    end = start !== undefined ? request.offset + request.limit : undefined,
                    sortDirection = request.sortDir === 'asc' ? 1 : -1,
                    responseData = data;

                if (request.filters !== undefined) {
                    Object.keys(request.filters)
                        .forEach(function (attr) {
                            var filterValue = request.filters[attr];

                            responseData = responseData.filter(function (item) {
                                switch (dataTypes[attr]) {
                                    case 'string':
                                        return item[attr] !== undefined && item[attr].indexOf(filterValue) !== -1;
                                    case 'boolean':
                                        return item[attr] !== undefined && item[attr] === (filterValue === 'true');
                                }
                            });
                        });
                }

                if (request.sortAttr !== undefined) {
                    responseData.sort(function (itemA, itemB) {
                        var attrA = itemA[request.sortAttr],
                            attrB = itemB[request.sortAttr],
                            comparisonResult;

                        switch (dataTypes[request.sortAttr]) {
                            case 'string':
                                comparisonResult = attrA.localeCompare(attrB);
                                break;
                            case 'int':
                                comparisonResult = attrA > attrB ? 1 : -1;
                                break;
                            case 'boolean':
                                comparisonResult = attrA === attrB ? 1 : -1;
                                break;
                        }

                        return comparisonResult * sortDirection;
                    });
                }

                if (request.fields !== undefined) {
                    var fields = Array.isArray(request.fields) ? request.fields : [request.fields],
                        fieldLength = fields.length;

                    responseData = responseData.map(function (item) {
                        var res = {};

                        for (var i = 0; i < fieldLength; i++) {
                            res[fields[i]] = item[fields[i]];
                        }

                        return res;
                    });
                }

                var res = {
                    items: start !== undefined ? responseData.slice(start, end) : responseData,
                    total: responseData.length
                };
                resolve(coreUtils.clone(res, true));
            }, 500);
        });
    }

    function mockDelete(users) {
        data = data.filter(function (item) {
            var indexOfItem = users.indexOf(item.id.toString());
            if (indexOfItem !== -1) {
                users.splice(indexOfItem, 1);
                return false;
            }
            return true;
        });
    }

    return {
        get: mockGet,
        delete: mockDelete
    };
});
