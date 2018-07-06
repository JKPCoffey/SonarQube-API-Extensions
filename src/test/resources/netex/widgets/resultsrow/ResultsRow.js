define([
    'tablelib/Row'
], function (Row) {
    return Row.extend({
        /**
         * Inherited Method
         */
        onRowReady: function () {
            if (this.getData().getAttribute('poId') === 'null') {
                this.getElement().setStyle({
                    'color': '#b0b0af',
                    'background-color': '#f5f5f5'
                });
            }
        }
    });
});