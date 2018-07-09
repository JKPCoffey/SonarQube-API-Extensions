define([
    'jscore/core',
    './ListContainerView',
    './listitem/ListItem',
    'jscore/ext/privateStore'
], function(core, View, ListItem, PrivateStore) {

    var _ = PrivateStore.create();

    /**
     * List container is a widget that display a list of widgets in different directions.
     *
     * @options
     *   {String} direction - direction the widgets are going to be displayed [row or column] (default: row)
     *   {Boolean} separators - whether to display separators between widgets or not (default: false)
     *
     * @custom
     *   ### Example
     *   ```
     *   var jobCardsContainer = new ListContainer({
     *     direction: 'column',
     *     separators: true
     *   });
     *   ```
     *
     * @class bulkimportlib/widgets/ListContainer
     * @extends Widget
     */
    return core.Widget.extend({

        View: View,

        /**
         * @method onViewReady
         * @private
         */
        onViewReady: function() {
            _(this).props = {
                direction: this.options.direction || 'row',
                separators: !!this.options.separators
            };

            this.view.setDirection(_(this).props.direction);
        },

        /**
         * Add multiple widgets to the list
         * @method addWidgets
         * @param {Array<Widget>} widgets
         */
        addWidgets: function(widgets) {
            widgets.forEach(this.addWidget.bind(this));
        },

        /**
         * Add single widget to the list
         * @param {Widget} widget
         */
        addWidget: function(widget) {
            var wrapper = new ListItem({
                direction: _(this).props.direction,
                separators: _(this).props.separators
            });
            widget.attachTo(wrapper.getElement());
            wrapper.attachTo(this.getElement());
        }
    });
});
