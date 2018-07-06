define([
    'tablelib/Cell',
    'i18n!networkexplorerlib/ResultsCell.json'
], function (Cell, strings) {

    return Cell.extend({

        DELETED: 'Deleted',

        onCellReady: function () {
            this.getElement().setAttribute('class','elNetworkExplorerLib-rResults-cell');
        },

        setValue: function (value) {
            if (this.isObjectDeleted()) {
                this.getElement().setModifier('deletedObject');
                this.getElement().removeModifier('inapplicableAttribute');
                value = this.DELETED;
            } else if (!this.isAttributeApplicable()) {
                this.getElement().removeModifier('deletedObject');
                this.getElement().setModifier('inapplicableAttribute');
                value = '-';
            } else {
                this.getElement().removeModifier('deletedObject');
                this.getElement().removeModifier('inapplicableAttribute');
            }
            this.getElement().setText(value);
        },

        setTooltip: function (value) {
            if (this.isObjectDeleted()) {
                value = this.DELETED;
            } else if (!this.isAttributeApplicable()) {
                value = strings.get('notApplicable');
            }
            this.getElement().setAttribute('title', value);
        },

        isAttributeApplicable: function () {
            var columnAttribute = this.getColumnDefinition().attribute;
            var rowModel = this.getRow().getData();
            return rowModel.hasOwnProperty(columnAttribute);
        },
        isObjectDeleted: function () {
            var rowModel = this.getRow().getData();
            var deletedValues = Object.keys(rowModel).filter(function(key){
                return rowModel[key] === this.DELETED;
            }.bind(this));
            return deletedValues.length >= 2;
        }
    });
});