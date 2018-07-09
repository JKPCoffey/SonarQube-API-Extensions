this.settingsForm.addEventHandler('apply', function () {
                    this.trigger('table-settings:hide');
                    this.onTableSettingsChange();
                }.bind(this));