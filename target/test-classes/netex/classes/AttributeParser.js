define(function () {
    return {

        /**
         * Converts the complex attributes in the data to a more human readable format
         *
         * @method convertComplexAttributes
         * @param {Object} data The data to be processed
         */
        convertComplexAttributes: function(data) {
            // for each element of data
            for (var i = 0; i < data.length; i++){
                // for each attribute in element (only if attribute property exists)!
                for (var attribute in data[i].attributes) { //NOSONAR as inheritance is considered
                    // if data is an object literal
                    var dataAttribute = data[i].attributes[attribute];
                    if (dataAttribute && dataAttribute.constructor === {}.constructor) {
                        // Call method to get complex data type as string
                        var complexDataAsString = this.getComplexDataTypeAsString(dataAttribute);
                        data[i][attribute] = complexDataAsString;
                        data[i].attributes[attribute] = complexDataAsString;
                    } else if (dataAttribute && dataAttribute.constructor === [].constructor) {
                        var listDataAsString = this.getListDataTypeAsString(dataAttribute);
                        data[i][attribute] = listDataAsString;
                        data[i].attributes[attribute] = listDataAsString;
                    } else {
                        data[i][attribute] = dataAttribute;
                    }
                }
            }
            return data;
        },

        getComplexDataTypeAsString: function(data) {
            var complexDataInfoArr = [];
            for (var attr in data) {
                if (data.hasOwnProperty(attr)) {
                    complexDataInfoArr.push(attr + "=" + data[attr]);
                }
            }
            return complexDataInfoArr.join(", ");
        },

        getListDataTypeAsString: function(data) {
            var listDataInfoArr = [];
            for (var i = 0; i < data.length; i++) {
                var listItem = data[i];
                if(data[i].constructor === {}.constructor) {
                    listItem = "{" + this.getComplexDataTypeAsString(data[i]) + "}";
                }
                listDataInfoArr.push(listItem);
            }
            return listDataInfoArr.join(", ");
        }
    };
});
