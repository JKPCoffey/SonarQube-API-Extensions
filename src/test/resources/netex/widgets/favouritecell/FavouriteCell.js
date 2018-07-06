define([
    'tablelib/Cell',
    'uit!./favouriteCell.html'
], function(Cell, View) {
    return Cell.extend({

        View: View,

        setValue: function(isFavourite) {
            if (isFavourite) {
                this.view.findById('star').setAttribute('class', 'ebIcon ebIcon_star_yellow');
            } else {
                this.view.findById('star').setAttribute('class', 'ebIcon ebIcon_starOutline');
            }
        }
    });
});