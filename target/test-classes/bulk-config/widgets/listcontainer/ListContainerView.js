define([
    'jscore/core',
    'text!./_listContainer.html',
    'styles!./_listContainer.less'
], function(core, template, styles) {
    return core.View.extend({
        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        },

        setDirection: function(direction) {
            this.getElement().setStyle('flex-direction', direction);
        }
    });
});
