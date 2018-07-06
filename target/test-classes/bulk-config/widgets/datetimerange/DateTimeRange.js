define([
    'jscore/core',
    './DateTimeRangeView',
    'i18n!bulkimportlib/dictionary.json',
    'widgets/PopupDatePicker'
], function(core, View, dictionary, PopupDateTimePicker) {
    'use strict';

    /**
     * Example of usage. None of the params is mandatory.
     *
     *   var dateTimeRangePicker = new DateTimeRange({
     *       compact: {boolean},
     *       showTime: {bolean},
     *       readOnly: {boolean},
     *       blockFutureDates: {boolean},
     *       valueFrom: {Date},
     *       valueTo: {Date},
     *       mode: {String} 'locale' or 'international',
     *       utc: {boolean},
     *       labels: {
     *           from: {String},
     *           to: {String},
     *           YYYY: {String},
     *           MM: {String},
     *           DD: {String},
     *           hh: {String},
     *           mm: {String},
     *           ss: {String},
     *           hours: {String},
     *           minutes: {String},
     *           seconds: {String}
     *       }
     *   });
     *
     * @ui_events
     * change - Triggers when a date has been changed. Passes the object: {
     *      from: {Date}
     *      to: {Date}
     * }
     */
    return core.Widget.extend({

        setFrom: function(date) {
            this.createdFrom.setValue(date);
            this.createdFromDate = date;
            this.sendChangeEvent();
        },

        setTo: function(date) {
            this.createdTo.setValue(date);
            this.createdToDate = date;
            this.sendChangeEvent();
        },

        clear: function() {
            this.createdFrom.clear();
            this.createdTo.clear();
            this.createdFromDate = undefined;
            this.createdToDate = undefined;
            this.sendChangeEvent();
        },

        /* ++++++++++++++++++++++++++++++++++++++++++ PRIVATE METHODS ++++++++++++++++++++++++++++++++++++++++++ */

        init: function() {
            this.options = this.options || {};
            this.options.labels = this.options.labels || {};
            this.options.labels.from = this.options.labels.from || 'From';
            this.options.labels.to = this.options.labels.to || 'To';
            this.createdFromDate = this.options.valueFrom;
            this.createdToDate = this.options.valueTo;
        },

        view: function() {
            return new View(this.options.labels);
        },

        onViewReady: function() {
            this.checkedDate = new Date(0);

            this.createdFrom = this.getDateTimePickerWidget(this.getDateInRangeForStart.bind(this));
            if (this.createdFromDate) {
                this.createdFrom.setValue(this.createdFromDate);
            }
            this.createdFrom.attachTo(this.view.getCreatedFromFilterHolder());
            this.createdFrom.addEventHandler('dateselect', this.onDateChangeForStart.bind(this));
            this.createdFrom.addEventHandler('dateclear', this.onDateClearForStart.bind(this));

            this.createdTo = this.getDateTimePickerWidget(this.getDateInRangeForEnd.bind(this));
            if (this.createdToDate) {
                this.createdTo.setValue(this.createdToDate);
            }
            this.createdTo.attachTo(this.view.getCreatedToFilterHolder());
            this.createdTo.addEventHandler('dateselect', this.onDateChangeForEnd.bind(this));
            this.createdTo.addEventHandler('dateclear', this.onDateClearForEnd.bind(this));
        },

        getDateTimePickerWidget: function(dateInRange) {
            return new PopupDateTimePicker({
                compact: this.options.compact,
                showTime: this.options.showTime,
                readOnly: this.options.readOnly,
                mode: this.options.mode,
                utc: this.options.utc,
                dateInRange: dateInRange,
                labels: {
                    YYYY: this.options.labels.YYYY,
                    MM: this.options.labels.MM,
                    DD: this.options.labels.DD,
                    hh: this.options.labels.hh,
                    mm: this.options.labels.mm,
                    ss: this.options.labels.ss,
                    hours: this.options.labels.hours,
                    minutes: this.options.labels.minutes,
                    seconds: this.options.labels.seconds
                }
            });
        },

        setCheckedDate: function(year, month, day) {
            this.checkedDate.setFullYear(year);
            this.checkedDate.setMonth(month);
            this.checkedDate.setDate(day);
            this.checkedTime = this.checkedDate.getTime();
            this.currentTime = Date.now();
        },

        checkFutureDateAvailability: function() {
            return !this.options.blockFutureDates || this.checkedTime < this.currentTime;
        },

        getDateInRangeForStart: function(year, month, day) {
            this.setCheckedDate(year, month, day);
            if (!this.createdToDate) {
                return this.checkFutureDateAvailability();
            }
            return this.checkedTime <= this.createdToDate.getTime() && this.checkFutureDateAvailability();
        },

        getDateInRangeForEnd: function(year, month, day) {
            this.setCheckedDate(year, month, day);
            if (!this.createdFromDate) {
                return this.checkFutureDateAvailability();
            }
            return this.checkedTime >= this.createdFromDate.getTime() && this.checkFutureDateAvailability();
        },

        /**
         * After manually selecting the date, the function is called only once, with no arguments.
         * After manual removal of the date, the function is called twice,
         * the first time with the argument and the second time with no argument.
         *
         * @method onDateChangeForStart
         * @param {Date} clearEvent Date object to indicates whether the function is called when deleting the date
         */
        onDateChangeForStart: function(clearEvent) {
            if (clearEvent) {
                return;
            }
            this.createdFromDate = this.createdFrom.getValue();
            // refresh second picker to update its date range
            this.createdTo.setValue(this.createdToDate);
            this.sendChangeEvent();
        },

        onDateClearForStart: function() {
            this.createdFromDate = undefined;
            this.createdTo.setValue(this.createdToDate);
            this.sendChangeEvent();
        },

        onDateChangeForEnd: function(clearEvent) {
            if (clearEvent) {
                return;
            }
            this.createdToDate = this.createdTo.getValue();
            if (this.createdToDate &&
                this.createdToDate.getHours() +
                this.createdToDate.getMinutes() +
                this.createdToDate.getSeconds() === 0)
            {
                this.createdToDate.setHours(23);
                this.createdToDate.setMinutes(59);
                this.createdToDate.setSeconds(59);
                this.createdTo.setValue(this.createdToDate);
            }
            // refresh second picker to update its date range
            this.createdFrom.setValue(this.createdFromDate);
            this.sendChangeEvent();
        },

        onDateClearForEnd: function() {
            this.createdToDate = undefined;
            this.createdFrom.setValue(this.createdFromDate);
            this.sendChangeEvent();
        },

        sendChangeEvent: function() {
            this.trigger('change', {
                from: this.createdFrom.getValue(),
                to: this.createdTo.getValue()
            });
        }
    });
});
