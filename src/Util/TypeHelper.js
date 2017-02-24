(function (Global, Namespace) {
    'use strict';

    Namespace.TypeHelper = {
        TYPE_STRING:    'string',
        TYPE_OBJECT:    'object',
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

        isStringEmpty: function (variable, variableName) {
            this.assertString(variable, variableName);
            return (variable.trim() === '');
        },

        assertPositiveInteger: function(variable, variableName, allowZero)
        {
            var min = allowZero ? 0 : 1;

            if (this.typeOf(variable) !== this.TYPE_NUMBER || (variable % 1) !== 0 || variable < min) {
                throw new TypeError('Variable "'+ variableName +'" must be a positive integer');
            }
        }
    }

})(self, Util.Namespace.create("Js.Util.TypeHelper"));
