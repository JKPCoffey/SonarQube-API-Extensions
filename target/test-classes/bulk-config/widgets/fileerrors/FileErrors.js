define([
    'jscore/core',
    './FileErrorsView',
    "i18n!bulkimportlib/dictionary.json"
], function (core, View, dictionary) {
    "use strict";
    return core.Widget.extend({
        view: function () {
            if (!this.options.failuresCount) {
                this.options.failureReason = '';
            }
            return new View({
                data: this.options,
                dictionary: dictionary
            });
        }
    });
});
