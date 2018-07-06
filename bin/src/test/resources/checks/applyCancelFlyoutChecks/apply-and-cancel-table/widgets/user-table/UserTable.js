this.settingsForm.addEventHandler('apply', function () {
                    this.trigger('table-settings:hide');
                    this.onTableSettingsChange();
                }.bind(this));

this.settingsForm.addEventHandler('cancel', function () {
    this.trigger('table-settings:hide');
}.bind(this));