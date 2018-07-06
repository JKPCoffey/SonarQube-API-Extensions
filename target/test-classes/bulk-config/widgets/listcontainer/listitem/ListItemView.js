define([
    'jscore/core',
    'text!./_listItem.html',
    'styles!./_listItem.less'
], function(core, template, styles) {
    return core.View.extend({
        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        },

        setDirection: function(direction) {
            this.getElement().setModifier('direction', direction);
        },

        showSeparator: function() {
            this.getElement().setModifier('separator');
        }
    });
});
