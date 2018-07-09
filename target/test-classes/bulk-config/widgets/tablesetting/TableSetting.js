define([
    'jscore/core',
    './TableSettingView',
    'tablelib/TableSettings',
    'widgets/Dialog',
    'container/api',
    'i18n!bulkimportlib/dictionary.json'
], function(core, View, TableSettings, Dialog, Container, i18n) {

    return core.Widget.extend({

        View: View,

        onViewReady: function() {
            var tableColumns = this.options.columns.map(function(column) {
                return {
                    title: column.name,
                    attribute: column.value,
                    width: column.width,
                    resizable: true,
                    visible: column.visible,
                    sortable: column.sortable,
                    cellType: column.cellType,
                    bgColor: column.bgColor,
                    disableVisible: column.name === 'Job Name' ? true : false,
                    pinned: column.pinned
                };
            });
            this.tableSettings = new TableSettings({
                columns: tableColumns,
                showPins: true,
                selectDeselectAll: true
            });
            this.tableSettings.attachTo(this.view.getSettings());
            this.view.getApply().addEventHandler('click', this.apply, this);
            this.view.getCancel().addEventHandler('click', this.cancel, this);
        },

        apply: function() {
            var updatedColumns = this.tableSettings.getUpdatedColumns();
            var visibleColumns = updatedColumns.filter(function(column) {
                return column.visible;
            });
            if (visibleColumns.length === 0) {
                this.showDialog();
            } else {
                this.trigger('tablesettings:updateColumns', updatedColumns, true);
            }
        },

        cancel: function() {
            Container.getEventBus().publish('flyout:hide');
        },

        showDialog: function() {
            if (!this.dialog) {
                this.dialog = new Dialog({
                    type: 'warning',
                    header: i18n.get('noColumnsSelectedHeader'),
                    content: i18n.get('noColumnsSelectedBody'),
                    buttons: [{
                        caption: i18n.get('ok'),
                        action: this.hideDialog.bind(this),
                        color: 'darkBlue'
                    }]
                });
            }
            this.dialog.show();
        },

        hideDialog: function() {
            this.dialog.hide();
        }
    });
});
