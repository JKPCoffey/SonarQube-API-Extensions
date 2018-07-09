define([
    'jscore/core',
    './JobCardView',
], function(core, View) {
    return core.Widget.extend({
        view: function() {
            return new View({
                header: this.options.header,
                content: (this.options.content instanceof core.Widget) ? undefined : this.options.content
            });
        },

        setCSS: function(elem, param, val) {
            elem.setStyle(param, val);
        },

        selected: false,

        onViewReady: function(options) {
            this.setContent(options.content);

            if (options.markValue && options.content > 0) {
                this.wrapper = this.getElement().find('.elBulkImportLib-wJobCard-wrapper');
                this.header = this.getElement().find('.elBulkImportLib-wJobCard-header');
                this.content = this.getElement().find('.elBulkImportLib-wJobCard-content');

                this.setCSS(this.header, 'color', options.markValue);
                this.setCSS(this.content, 'color', options.markValue);

                if (options.clickCallback) {
                    this.setCSS(this.wrapper, 'cursor', 'pointer');
                    this.selected = options.selected || false;
                    if (this.selected) {
                        this.setActiveButton();
                        this.setSelectedMouseOver();
                    }
                    else {
                        this.setUnselectedMouseOver();
                    }
                    this.wrapper.addEventHandler('click', function() {
                        options.clickCallback();
                        this.mouseover.destroy();
                        this.mouseout.destroy();
                        this.selected = !this.selected;
                        if (this.selected) {
                            this.setCSS(this.wrapper, 'opacity', 0.5);
                        }
                        else {
                            this.wrapper.removeStyle('opacity');
                        }
                        this.setActiveButton();
                    }.bind(this));

                }
            }
        },

        setActiveButton: function() {
            if (this.selected) {
                this.setSelectedColors();
                this.setSelectedMouseOver();
            }
            else {
                this.setUnselectedColors();
                this.setUnselectedMouseOver();
            }
        },

        setSelectedColors: function() {
            this.setCSS(this.wrapper, 'background-color', this.options.markValue);
            this.setCSS(this.header, 'color', '#fefefe');
            this.setCSS(this.content, 'color', '#fefefe');
        },

        setUnselectedColors: function() {
            this.setCSS(this.wrapper, 'background-color', '#b0b2b3');
            this.setCSS(this.header, 'color', this.options.markValue);
            this.setCSS(this.content, 'color', this.options.markValue);
        },

        setSelectedMouseOver: function() {
            this.mouseover = this.wrapper.addEventHandler('mouseover', function() {
                this.setCSS(this.wrapper, 'opacity', 0.5);
            }.bind(this));
            this.mouseout = this.wrapper.addEventHandler('mouseout', function() {
                this.wrapper.removeStyle('opacity');
            }.bind(this));
        },

        setUnselectedMouseOver: function() {
            this.mouseover = this.wrapper.addEventHandler('mouseover', function() {
                this.setCSS(this.wrapper, 'background-color', '#b0b2b3');
            }.bind(this));
            this.mouseout = this.wrapper.addEventHandler('mouseout', function() {
                this.wrapper.removeStyle('background-color');
            }.bind(this));
        },

        setContent: function(content) {
            if (content instanceof core.Widget) {
                content.attachTo(this.view.getContent());
            }
        }
    });
});
