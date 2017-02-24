var Util = Util || {};

(function (Global, Util, Namespace) {
    'use strict';

    Namespace.Namespace = {

        /**
         * Create a namespace if it doesn't already exist.
         *
         * @param {String}         namespace
         * @param {Window|Object}  [scope]  Defaults to self.
         *
         * @returns {Object|Function}
         */
        create: function(namespace, scope)
        {
            var parts, length, next, part = 0;

            scope = scope || Global;

            Util.TypeHelper.assertEmptyString(namespace, 'namespace');
            Util.TypeHelper.assertObject(scope, 'scope');

            parts   = namespace.trim().split('.');
            length  = parts.length;

            for (part; part < length; part++) {
                next = parts[part];

                if (!(/^([A-Za-z0-9])+$/.test(next))) {
                    throw new EvalError(
                        'Unable to create namespace. "' + next + '" is not a valid object key within "' + namespace + '"'
                    );
                }

                scope[next] = scope[next] || {};
                scope       = scope[next];
            }

            return scope;
        }
    };
})(self, Util, Util);