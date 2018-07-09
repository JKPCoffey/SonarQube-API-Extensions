/*global define, Promise */
define([
    'example-lib/utils/MockData'
], function (mockData) {
    'use strict';

    /**
     * This module emulates the connection with a server while mimicking the API of net.ajax.
     *
     * /!\ The module was designed to run exclusively with the example e.g. no shared references.
     */

    var serverData,
        serverDataById;

    function initMockData() {
        serverData = mockData.generate({
            rows: 50000,
            attributes: {
                id: 'id',
                firstName: 'firstName',
                lastName: 'lastName',
                role: 'role'
            }
        });
        serverDataById = {};

        serverData.forEach(function (item, index) {
            serverData[index] = item;
            serverDataById[item.id] = item;
        });
    }

    initMockData();

    //-----------------------------------------------------------------

    function checkCurrentSortingWithRequestSorting(options) {
        /*jshint validthis:true */
        if (!this.serverSortAttr && !this.serverSortMode || (this.serverSortAttr !== options.sortAttr || this.serverSortMode !== options.sortMode)) {
            sortData(options.sortAttr, options.sortMode);

            this.serverSortAttr = options.sortAttr;
            this.serverSortMode = options.sortMode;
        }
    }

    function sortData(attribute, sortMode) {
        var sortFunc = function (a, b) {
            var comp = a[attribute].localeCompare(b[attribute]);
            return sortMode === 'asc' ? comp : comp * -1;
        };

        if (attribute === 'id') {
            sortFunc = function (a, b) {
                return sortMode === 'asc' ? a[attribute] - b[attribute] : b[attribute] - a[attribute];
            };
        }

        serverData.sort(sortFunc);
    }

    function getDataSegment(start, end) {
        return serverData.slice(start, end);
    }

    //----------------------------------------------------------------- Exposed Mock Server API

    function getDataLength(options) {
        options.success(serverData.length);
    }

    function getIds(options) {
        /*jshint validthis:true */
        setTimeout(function () {
            checkCurrentSortingWithRequestSorting.call(this, options);

            var startItem = serverDataById[options.startId],
                endItem = serverDataById[options.endId],
                indexA = serverData.indexOf(startItem),
                indexB = serverData.indexOf(endItem),
            // based on the current sort mode, the index can be reversed
            // the data is stored in an array (ascending order indexes)
                sortedIndexes = [indexA, indexB].sort();

            options.success(
                getDataSegment(sortedIndexes[0], sortedIndexes[1] + 1).map(function (item) {
                    return item.id;
                })
            );
        }, 500);
    }

    function getAllIds(options) {
        /*jshint validthis:true */
        setTimeout(function () {
            checkCurrentSortingWithRequestSorting.call(this, options);
            options.success(
                serverData.map(function (item) {
                    return item.id;
                })
            );
        }, 500);
    }

    function getData(options) {
        /*jshint validthis:true */
        // cancel any pending request
        if (this.lastRequestTimeout !== undefined) {
            clearTimeout(this.lastRequestTimeout);
        }

        this.lastRequestTimeout = setTimeout(function () {
            checkCurrentSortingWithRequestSorting.call(this, options);

            delete  this.lastRequestTimeout;

            options.success({
                data: getDataSegment(options.index, options.index + options.length),
                length: serverData.length
            });
        }.bind(this), 500);
    }


    return {
        getData: getData,
        getIds: getIds,
        getAllIds: getAllIds,
        getDataLength: getDataLength
    };
});
