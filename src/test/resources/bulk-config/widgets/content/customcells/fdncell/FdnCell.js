define([
    'tablelib/Cell',
    './FdnCellView'
], function (Cell, View) {
    "use strict";
    return Cell.extend({
        View: View,
        setValue: function (value) {
            var status = value.split("|");
            this.view.getFdnTextHolder().setText("FDN:" + status[0]);
        }
    });
});
