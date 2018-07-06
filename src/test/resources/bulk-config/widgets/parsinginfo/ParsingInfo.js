define([
    'jscore/core',
    './ParsingInfoView',
    "i18n!bulkimportlib/dictionary.json"
], function (core, View, dictionary) {
    "use strict";
    return core.Widget.extend({

        view: function () {
            return new View(dictionary);
        },

        onViewReady: function() {
            this.windowResizeEvtId = core.Window.addEventHandler('resize', this.redrawTable.bind(this));
        },

        onDestroy: function () {
            core.Window.removeEventHandler('resize', this.windowResizeEvtId);
        },

        onDOMAttach: function() {
            this.redrawTable();
        },

        redrawTable: function() {
            this.getElement().setStyle(
                {height: (core.Window.getProperty('innerHeight') - this.getElement().getPosition().top - 10) + 'px'}
            );
        }

    });
});
