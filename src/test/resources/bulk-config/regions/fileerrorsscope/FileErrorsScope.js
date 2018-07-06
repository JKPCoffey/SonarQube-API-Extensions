define([
    'jscore/core',
    './FileErrorsScopeView',
    '../../widgets/fileerrors/FileErrors'
], function (core, View, FileErrorsContent) {
    'use strict';
    return core.Region.extend({
        View: View,

        init: function (data) {
            this.fileErrorContent = new FileErrorsContent(data);
        },

        onStart: function() {
            this.fileErrorContent.attachTo(this.getElement());
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
                {height: (core.Window.getProperty('innerHeight') - this.getElement().getPosition().top - 3) + 'px'}
            );
        }

    });

});
