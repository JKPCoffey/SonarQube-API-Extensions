define([
    'jscore/core',
    'template!./_customContent.html',
    'styles!./_customContent.less'
], function(core, template, style) {

    return core.View.extend({

        getTemplate: function() {
            return template(this.options, {
                helpers: {

                    checkIfAction: function(options) {
                        if (this.actionName !== undefined) {
                            return options.fn(this);
                        } else {
                            return options.inverse(this);
                        }

                    },
                    checkIfAddInfoIsEmpty: function(value, options) {
                        if (value === '' || value === 'NA') {
                            return options.fn(this);
                        } else {
                            return options.inverse(this);
                        }
                    },

                    getBooleanAsString: function(value) {
                        switch (value) {
                        case true:
                            return 'true';
                        case false:
                            return 'false';
                        default:
                            return value;
                        }
                    },

                    checkIfErroredRow: function(value, options) {
                        if (value === 'Failed') {
                            return options.fn(this);
                        } else {
                            return options.inverse(this);
                        }
                    },

                    checkIfAttributesNotExist: function(options) {
                        if (typeof this.details === 'undefined') {
                            return options.inverse(this);
                        } else {
                            return options.fn(this);
                        }
                    }
                }
            });
        },

        getNotificationContent: function() {
            return this.getElement().find('.elBulkImportLib-wCustomContent-notification');
        },

        getStyle: function() {
            return style;
        }
    });
});
