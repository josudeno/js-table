var Util = Util || {};

(function (Namespace) {
    'use strict';

    Namespace.TypeHelper = {
        TYPE_NUMBER:    'number',
        TYPE_STRING:    'string',
        TYPE_OBJECT:    'object',
        TYPE_ARRAY:     'Array',
        TYPE_UNDEFINED: 'undefined',

        assertObject: function(variable, variableName) {
            if (variable === null || typeof variable !== 'object') {
                throw new TypeError('Variable "'+ variableName +'" is not an object');
            }
        },

        assertString: function (variable, variableName) {
            if (typeof variable !== this.TYPE_STRING) {
                throw new TypeError('Variable "' + variableName + '" is not of type "' + this.TYPE_STRING + '"');
            }
        },

        assertEmptyString: function (variable, variableName) {
            this.assertString(variable, variableName);
            if (variable.trim() === '') {
                throw new TypeError('Variable "' + variableName + '" is an empty string');
            }
        },

        assertPositiveInteger: function(variable, variableName, allowZero)
        {
            var min = allowZero ? 0 : 1;

            if (typeof variable !== this.TYPE_NUMBER || (variable % 1) !== 0 || variable < min) {
                throw new TypeError('Variable "'+ variableName +'" must be a positive integer');
            }
        },

        assertArray: function(variable, variableName)
        {
            if (Object.prototype.toString.call(variable).match(/(\w+)\]/)[1] !== this.TYPE_ARRAY) {
                throw new TypeError('Variable "'+ variableName +'" is not an array');
            }
        }
    }

})(Util);