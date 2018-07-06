define(function () {
    return {
        cloneObject: function(object) {

            var cloneOfObject = object ? JSON.parse(JSON.stringify(object)) : null;

            return cloneOfObject;
        }
    };
});