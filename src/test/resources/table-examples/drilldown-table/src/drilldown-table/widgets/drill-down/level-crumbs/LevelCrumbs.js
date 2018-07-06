/*global define*/
define([
    'jscore/core',
    './item/LevelCrumbItem',
    './LevelCrumbsView'
], function (core, LevelCrumbItem, View) {
    'use strict';

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            var dots = new LevelCrumbItem({
                name: '...',
                action: function () {
                    // execute the action of the item symbolized by the dots
                    // index determined during the redraw
                    this.items[this.dotsCrumbIndex].executeAction();
                }.bind(this)
            });

            dots.getElement().setAttribute('tabindex', '0');
            dots.attachTo(this.view.getList());
            dots.addEventHandler('item:click', function () {
                // do not bind the function directly as the value dotsCrumbIndex is updated
                this.onItemClick(this.dotsCrumbIndex);
            }.bind(this));

            this.dots = dots;
            this.items = [];
            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.redraw.bind(this));
        },

        onDestroy: function () {
            core.Window.removeEventHandler(this.windowResizeEvtId);
        },

        addItem: function (itemData) {
            var itemCrumb = new LevelCrumbItem(itemData),
                itemIndex;

            //Set tabindex on last child before drilling down
            if (this.items.length !==0) {
                var lastItem = this.items[this.items.length - 1];
                lastItem.getElement().setAttribute('tabindex', '0');
            }

            this.items.push(itemCrumb);
            // the index is used to set the item as last child on click
            itemIndex = this.items.length - 1;

            itemCrumb.addEventHandler('item:click', this.onItemClick.bind(this, itemIndex));

            this.redraw();
        },

        redraw: function () {
            var element = this.getElement(),
                maxWidth = element.getProperty('offsetWidth'),
                listElt = this.view.getList();

            // hide before measuring the full width of the list
            this.dots.setHidden(true);
            detachAll(this.items);
            attachAll(this.items, listElt);

            // when the list is longer than the available space
            if (maxWidth !== 0 && maxWidth < listElt.getProperty('offsetWidth')) {
                this.dotsCrumbIndex = 0;

                // show the dots to give access to latest parent hidden
                this.dots.setHidden(false);

                // hide as many item as required to fit the list
                this.items.some(function (item, index) {
                    var listWidth = listElt.getProperty('offsetWidth'),
                        listSmallerThanContainer = listWidth < maxWidth;

                    if (!listSmallerThanContainer) {
                        item.detach();
                    }
                    else {
                        // update which element is represented by the dots
                        this.dotsCrumbIndex = index - 1;
                    }

                    return listSmallerThanContainer;
                }.bind(this));
            }
        },

        onItemClick: function (itemIndex) {
            for (var i = itemIndex + 1; i < this.items.length; i++) {
                this.items[i].destroy();
            }

            this.items.splice(itemIndex + 1);

            //Remove tabindex attribute from last child
            var lastItem = this.items[this.items.length - 1];
            lastItem.getElement().removeAttribute('tabindex');

            this.redraw();
        }
    });

    function detachAll(arr) {
        arr.forEach(function (widget) {
            widget.detach();
        });
    }

    function attachAll(arr, elt) {
        arr.forEach(function (widget) {
            widget.attachTo(elt);
        });
    }
});
