define([
    'jscore/core',
    './ParameterScopeView',
    '../../widgets/content/Content'
], function(core, View, ParameterContent) {
    'use strict';

    return core.Region.extend({
        View: View,

        init: function(data) {
            this.parameterContent = new ParameterContent(data);
        },

        onStart: function() {
            this.parameterContent.attachTo(this.getElement());
        }
    });

});
