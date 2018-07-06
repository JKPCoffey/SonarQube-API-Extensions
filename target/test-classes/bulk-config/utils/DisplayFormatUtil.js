define([], function () {
    return {

        formatValuesBasedOnType: function (attributeData) {
            if (attributeData) {
                if (attributeData.modifiedValue) {
                    attributeData.modifiedValue = this.formatAttrValues(attributeData.modifiedValue);
                } else {
                    return this.formatAttrValues(attributeData);
                }
            }
        },

        formatAttrValues: function (values) {
            var formattedValue,
                valueType;
            valueType = this.getValueType(values);

            switch (valueType) {
                case "object":
                    formattedValue = this.formatObject(values);
                    break;
                case "array":
                    formattedValue = this.formatArrayOfValues(values);
                    break;
                case "simple":
                    formattedValue = values;
                    break;
                default:
            }
            return formattedValue;
        },

        getValueType: function (values) {
            if (values) {
                if (values.constructor === {}.constructor) {
                    return "object";
                    //if the attr value is an array (sequence)
                } else if (values.constructor === [].constructor) {
                    return "array";
                    //if the attr is a simple attribute
                } else {
                    return "simple";
                }
            } else {
                return "simple";
            }
        },

        //to format values with type array
        formatArrayOfValues: function (values) {
            var arrayValues = [],
                firstValue = values[0],
                value;
            //attr value is a sequence containing struct
            if (firstValue && firstValue.constructor === {}.constructor) {
                for (var i = 0; i < values.length; i++) {
                    value = this.formatObject(values[i]);
                    arrayValues.push(value);
                }
                arrayValues = arrayValues.join(",");
            } else {
                arrayValues = this.formatArrayOfSimpleValues(values);
            }
            return "[" + arrayValues + "]";
        },

        formatObject: function (values) {
            var data = [],
                value;
            //Sorting the struct members alphabetically;
            var sortedValues = {};
            Object.keys(values)
                .sort()
                .forEach(function(v, i) {
                    sortedValues[v] = values[v];
                });
            for (var property in sortedValues) {
                value = values[property];
                //if the value of a property is sequence i.e, for struct with sequence
                if (value && value.constructor === [].constructor) {
                    data.push(property + '=[' + this.formatArrayOfSimpleValues(value) + ']');
                } else { // values are other than sequence.
                    data.push(this.formatSimplePropertyAndValue(property, value));
                }
            }
            return "{" + data.join(", ") + "}";
        },

        formatArrayOfSimpleValues: function (values) {
            if (typeof values[0] === "string") {
                return '"' + values.join('","') + '"';
            } else {
                return values.join(",");
            }
        },

        formatSimplePropertyAndValue: function (property, value) {
            //to add quotes to object values other than numbers
            if (typeof value === "string") {
                return (property + '="' + value + '"');
            } else {
                return (property + "=" + value);
            }
        }

    };
});