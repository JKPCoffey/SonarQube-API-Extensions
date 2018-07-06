define([
    'jscore/core',
    'tablelib/Cell',
    './StatusInfoView'
], function (core, Cell, View) {
    "use strict";
    return Cell.extend({
        View: View,

        setValue: function (value) {
            if(value.indexOf("|") > -1) {
                var status = value.split("|");
                if(status[1] === "Success") {
                    this.view.setStatusStyleForSuccess();
                    this.view.setStatusSuccessIcon();
                } else if(status[1] === "Failed" && this.options.row.options.model.details.status === 'INVALID'){
                    this.view.setStatusStyleForError("background-color:#ff7600;border-radius:5px;border-color:#ff7600");
                    this.view.setStatusFailedIcon();
                }
                else if(status[1] === "Failed"){
                    this.view.setStatusStyleForError("background-color:#E32219;border-radius:5px;border-color:#E32219");
                    this.view.setStatusFailedIcon();
                }
                this.view.getStatusTextHolder().setAttribute("style", " color:#ffffff;");
                this.view.getStatusTextHolder().setText(status[0]);
            } else {
                this.view.getStatusTextHolder().setText(value);
            }
        }
    });
});
