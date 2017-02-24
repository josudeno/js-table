var Util = Util || {};

(function (Document, Util, Namespace) {
    'use strict';

    /**
     * @constructor
     */
    Namespace.HTMLElement = function () {
    };


    Namespace.HTMLElement.prototype = {
        /** @type {HTMLElement} container */
        container: null,

        /** @type {Object} */
        elements: {},

        /**
         * Creates a HTML element.
         *
         * @param {string} tagName
         * @param {string} className
         *
         * @return {HTMLElement}
         */
        createElement: function(tagName, className) {
            var el;

            className = typeof className !== 'undefined' ?  className : '';

            Util.TypeHelper.assertString(tagName);


            if (typeof this.elements.element === 'undefined') {
                el = Document.createElement(tagName);
            } else {
                //"clone" the element
                el = JSON.parse(JSON.stringify(this.elements.element));
                this.elements[tagName] = el;
            }

            if (className.length > 0) {
                el.className = className;
            }
            return el;
        }
    };

})(document, Util, Util.Namespace.create("Util.Factory"));
