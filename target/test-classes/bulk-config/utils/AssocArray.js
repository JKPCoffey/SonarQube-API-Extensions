define([
], function() {

    function AssocArray() {
        this.data = [];
        this.index = {};
        this.length = 0;
    }

    AssocArray.prototype.add = function(key, value, index) {
        if(typeof index === 'number'){
            this.index[key] = index;
            this.data[index] = value;
        }
        else {
            this.index[key] = this.data.length;
            this.data.push(value);
        }
        this.length ++;
        return this;
    };

    AssocArray.prototype.get = function(key) {
        return this.data[this.index[key]];
    };

    AssocArray.prototype.getByIndex = function(index) {
        return this.data[index];
    };

    AssocArray.prototype.getAll = function() {
        return this.data;
    };

    AssocArray.prototype.getLength = function() {
        return this.length;
    };

    AssocArray.prototype.remove = function(key) {
        this.data.splice(this.index[key], 1);
        delete this.index[key + 1];
        var newKey;
        for (var objectKey in this.index) {
            //Restructures index to retain numerical sequence
            if (this.index.hasOwnProperty(objectKey) & objectKey > key + 1) {
                newKey = objectKey - 1;
                if (newKey !== objectKey) {
                    Object.defineProperty(this.index, newKey,
                        Object.getOwnPropertyDescriptor(this.index, objectKey));
                    delete this.index[objectKey];
                }
            }
        }
        this.length --;
        return this;
    };

    AssocArray.prototype.clear = function() {
        this.index = {};
        this.data = [];
        this.length = 0;
    };

    return AssocArray;
});