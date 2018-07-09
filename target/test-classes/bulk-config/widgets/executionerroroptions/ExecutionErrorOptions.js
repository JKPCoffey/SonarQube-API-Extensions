define([
    'jscore/core',
    'uit!./_executionErrorOptions.hbs',
    'i18n!bulkimportlib/dictionary.json'
], function(core, View, dictionary) {
    return core.Widget.extend({
        view: function() {
            return new View({
                dictionary: dictionary.content,
                executionPolicy: this.options,
                ifEqual: function(v1, v2, options) {
                    if (v1 === v2) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                }
            });
        }

    });
});
