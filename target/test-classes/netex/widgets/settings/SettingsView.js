define([
    "jscore/core",
    "template!./Settings.html",
    "styles!./Settings.less",
    "i18n!networkexplorerlib/Settings.json"
], function (core, template, styles, strings) {

    return core.View.extend({

        getTemplate: function() {
            return template({
                strings: strings
            });
        },

        getStyle: function() {
            return styles;
        },

        getSettings: function() {
            return this.getElement().find(".elNetworkExplorerLib-wSettings-Side-content");
        },

        getApply: function() {
            return this.getElement().find("button");
        }

    });

});
