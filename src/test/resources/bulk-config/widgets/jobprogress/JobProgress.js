define([
    'jscore/core',
    './JobProgressView',
], function(core, View) {
    return core.Widget.extend({

        view: function() {
            return new View(this.options);
        },

        onViewReady: function(options) {
            this.view.setProgress(options.value);
        }
    });
});
