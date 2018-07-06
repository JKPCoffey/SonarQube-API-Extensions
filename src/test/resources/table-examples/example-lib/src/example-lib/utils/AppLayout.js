/*global define*/
define([
    'layouts/TopSection',
    'ui-example-lib/Navigation'
], function (TopSection, navigationUtils) {
    'use strict';

    return {
        initializeTopSection: function (options) {
            var breadcrumbData = this.options.breadcrumb,
                layout = new TopSection({
                    context: this.getContext(),
                    title: this.options.properties.title,
                    breadcrumb: navigationUtils.adaptBreadcrumbForExample('Table Library', this.options.breadcrumb),
                    defaultActions: options.defaultActions
                });

            layout.setContent(options.content);

            layout.attachTo(this.getElement());
            this.layout = layout;
        }
    };
});
