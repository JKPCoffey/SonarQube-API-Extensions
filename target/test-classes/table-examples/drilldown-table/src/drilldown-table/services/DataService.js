/*global define*/
define(function () {
    'use strict';

    var lastId = 0;

    function generateLevel(maxLevel, currentLevel, prefix, parent) {
        var levelItems = [],
            randLevelItemsCount = (Math.round(Math.random() * 1000) % 10),
            tmpItem;

        if (currentLevel === 0) {
            // the example looks strange whith a small number of top level rows
            randLevelItemsCount = Math.max(5, randLevelItemsCount);
        }

        for (var i = 0; i < randLevelItemsCount; i++) {
            tmpItem = createItem({
                parent: parent !== undefined ? '(' + parent.id + ') ' + parent.name : undefined,
                name: prefix !== undefined ? (prefix + '.' + i) : i
            });

            if (currentLevel < maxLevel) {
                var children = generateLevel(maxLevel, currentLevel + 1, tmpItem.name, tmpItem);

                if (children.length !== 0) {
                    tmpItem.children = children;
                    tmpItem.hasChildren = true;
                }
            }

            levelItems.push(tmpItem);
        }

        return levelItems;
    }

    function createItem(data) {
        return {
            id: lastId++,
            name: data.name,
            parent: data.parent,
            hasChildren: false // set default value, overridden
        };
    }

    return {
        getData: function (maxLevel, prefix) {
            return generateLevel(maxLevel, 0, prefix);
        }
    };
});
