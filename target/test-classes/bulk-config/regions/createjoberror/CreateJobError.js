define([
    'jscore/core',
    'uit!./_createJobError.hbs',
    'i18n!bulkimportlib/dictionary.json'
], function (core, View, dictionary) {
    return core.Region.extend({
        view: function() {
            if (this.options.moreHelpMsg){
                return new View({
                    content: this.options.content,
                    moreHelpMsg: this.options.moreHelpMsg
                });
            }
            else{
                return new View({
                    content: this.options.content,
                    moreHelpMsg: dictionary.jobError.messages.moreHelpMsg
                });
            }
        }
    });
});
