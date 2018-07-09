define([
    'jscore/core',
    './ListItemView',
], function(core, View) {
    return core.Widget.extend({

        View: View,

        onViewReady: function(options) {
            this.view.setDirection(options.direction);

            if (options.separators) {
                this.view.showSeparator();
            }
        }
    });
});
