define([
    "jscore/core",
    "./SettingsView",
    "tablelib/TableSettings",
    "widgets/Dialog",
    "i18n!networkexplorerlib/Settings.json"
], function (core, View, TableSettings, Dialog, strings) {

    return core.Region.extend({

        View: View,

        /**
         * Lifecycle Method
         */
        onStart: function() {
            var tableColumns = [];
            for (var i = 0; i < this.options.columns.length; i++) {
                var tableColumn = {
                    title: this.options.columns[i].name,
                    attribute: this.options.columns[i].value,
                    resizable: true
                };
                for (var attr in this.options.columns[i]) {
                    if (attr !== 'name' && attr !== 'value') {
                        tableColumn[attr] = this.options.columns[i][attr];
                    }
                }
                tableColumns.push(tableColumn);
            }
            this.tableSettings = new TableSettings({
                columns: tableColumns
            });
            this.tableSettings.attachTo(this.view.getSettings());
            this.view.getApply().addEventHandler("click", this.apply, this);
        },

        apply: function() {
            var updatedColumns = this.tableSettings.getUpdatedColumns();
            var visibleColumns = updatedColumns.filter(function (column) {
                return column.visible;
            });
            if (visibleColumns.length === 0) {
                this.showDialog();
            } else {
                this.getEventBus().publish("Settings:updateColumns", updatedColumns, true);
            }
        },

        showDialog: function () {
            if (!this.dialog) {
                this.dialog = new Dialog({
                    type: 'warning',
                    header: strings.get('noColumnsSelectedHeader'),
                    content: strings.get('noColumnsSelectedBody'),
                    buttons: [{
                        caption: strings.get('ok'),
                        action: this.hideDialog.bind(this),
                        color: 'darkBlue'
                    }]
                });
            }
            this.dialog.show();
        },

        hideDialog: function () {
            this.dialog.hide();
        }

    });

});
