define([
    'jscore/core',
    './CollectionFromFileResultDescriptionView'
], function (core, View) {

    /**
     * This Widget represents a descriptive message which must be shown in a dialog in case after an operation of adding
     * objects from a file to a collection some of these objects are successfully added, while others are not added due
     * to some kind of failure. During the instantiation of the widget a width parameter must be specified, so that a
     * message exceeding this size would be displayed over multiple lines.
     *
     * @options
     *   {String} message - the message text.
     *   {String} width - the width size (e.g. "500px").
     *
     * @class CollectionFromFileResultDescription
     */
    return core.Widget.extend({

        View: View,

        /*
         * Widget lifecycle method
         */
        onViewReady: function () {
            this.view.getMessage().setText(this.options.message);
            this.view.getMessage().setStyle({width: this.options.width});
        }

    });
});