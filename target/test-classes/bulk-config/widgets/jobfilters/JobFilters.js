define([
    'jscore/core',
    './JobFiltersView',
    'container/api',
    'i18n!bulkimportlib/dictionary.json',
    '../DateTimeRange'
], function(core, View, Container, dictionary, DateTimeRange) {

    return core.Widget.extend({

        View: View,

        onViewReady: function() {
            this.view.getApply().addEventHandler('click', this.apply, this);
            this.view.getCancel().addEventHandler('click', this.cancel, this);

            this.dateTimeRange = {};
            this.dateTimeRangePicker = new DateTimeRange({
                compact: true,
                showTime: true,
                readOnly: false,
                blockFutureDates: true,
                mode: 'international',
                utc: true,
                labels: {
                    from: dictionary.jobFilters.from,
                    to: dictionary.jobFilters.to,
                    YYYY: dictionary.popupDatePickerLabels.YYYY,
                    MM: dictionary.popupDatePickerLabels.MM,
                    DD: dictionary.popupDatePickerLabels.DD,
                    hh: dictionary.popupDatePickerLabels.hh,
                    mm: dictionary.popupDatePickerLabels.mm,
                    ss: dictionary.popupDatePickerLabels.ss,
                    hours: dictionary.popupDatePickerLabels.hours,
                    minutes: dictionary.popupDatePickerLabels.minutes,
                    seconds: dictionary.popupDatePickerLabels.seconds
                }
            });
            this.dateTimeRangePicker.attachTo(this.view.getDateTimeRangeFilterHolder());
            this.dateTimeRangePicker.addEventHandler('change', function(data) {
                this.dateTimeRange = data;
            }.bind(this));
        },

        clearAllFilters: function() {
            this.dateTimeRangePicker.clear();
        },

        apply: function() {
            Container.getEventBus().publish('jobFilters:change', {
                // dateTimes have to be geted directly from pickers
                // because time changes are not properly triggered during editing
                dateTimeRange: {
                    from: this.dateTimeRangePicker.createdFrom.getValue(),
                    to: this.dateTimeRangePicker.createdTo.getValue()
                }
            });
            Container.getEventBus().publish('flyout:hide');
        },

        cancel: function() {
            Container.getEventBus().publish('flyout:hide');
        }

    });
});
