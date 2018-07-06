/*global define*/
define([
    'jscore/core',
    'text!./_topologyDropdown.html',
    'styles!./_topologyDropdown.less'
], function (core, template, styles) {

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getCaptionTextEl: function () {
            return this.getElement().find('.elNetworkExplorerLib-TopologyDropdown-captionText');
        },

        setCaptionText: function (text) {
            this.getCaptionTextEl().setText(text);
        },

        setType: function (type) {
            this.getElement().setModifier(type, null, 'elNetworkExplorerLib-TopologyDropdown');
        },

        removeType: function (type) {
            this.getElement().removeModifier(type, null, 'elNetworkExplorerLib-TopologyDropdown');
        }

    });
});
