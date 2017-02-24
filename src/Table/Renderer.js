(function (Document, Library, Namespace) {
    'use strict';

    /**
     * @param {HTMLElement} container  The html container.
     * @param {object} options  the options
     * @param {Namespace.HTMLElement} htmlFactory  the html factory
     * @constructor
     */
    Namespace.Renderer = function (container, options, htmlFactory) {
        this.container = container;

        if (typeof options === 'object') {
            this.tableClass = options.tableClass || 'dataTable';
        }

        this.recordsToShow = options.recordsToShow || 10;
        if (typeof htmlFactory === Namespace.HTMLHandler) {
            throw new ReferenceError('htmlHandler is not a valid html handler');
        }
        this.HTMLElementFactory = htmlFactory;
    };


    Namespace.Renderer.prototype = {
        /** @type {HTMLElement} container */
        container: null,
        /** @type {HTMLElement} target */
        table: null,
        rows: [],


        /**
         * Render html table from data.
         *
         * @param {Object}  data
         *
         * @return {Namespace.Table}
         */
        render: function(data)
        {
            if (Array.isArray(data)) {
                data = data.shift();
            }

            var container = this.container, table;

            if (typeof data !== 'object') {
                throw new ReferenceError('Data should be an object');
            }

            if (!container) {
                throw new ReferenceError('Unable to render without a container element');
            }

            this.table = this.createElement('table', this.tableClass);
            this.container.appendChild(this.table);

            this.rows = this.fetchRowsFromData(data, this.rows);
            this.appendColumnsHeadersFromData(data, this.table);
            this.appendRowsToTable(this.rows, this.table);

            return this.Table;
        },

        /**
         * Fetchs rows from the data object.
         * @param {Object}  data
         * @param {Array} array
         * @returns {*}
         * @private
         */
        fetchRowsFromData: function(data, array) {
            data.rows.forEach(function(row) {
                array.push(row);
            });
            return array;
        },

        /**
         * Returns the list of rows in memory.
         * @returns {Array}
         */
        getRows: function() {
            return this.rows;
        },

        /**
         * Render bar chart component based on grid data.
         *
         * @param {Array}  rows
         * @param {HTMLElement}  container
         *
         * @returns {HTMLElement}
         * @private
         */
        appendRowsToTable: function(rows, container) {

            var rowEl, row, tableRenderer, cellEl;
            tableRenderer = this;

            for (var i = 0; i < tableRenderer.recordsToShow; i++) {
                rowEl = tableRenderer.createElement('tr', '');
                row = rows[i];

                if (typeof row === 'undefined') {
                    break;
                }
                row.cells.forEach(function(cell) {
                    cellEl = tableRenderer.createElement('td', '');
                    var value = cell.value;
                    if (cell.valueType === 'datetime') {
                        value = Date(value);
                    }
                    cellEl.innerHTML = value;
                    rowEl.appendChild(cellEl);
                });

                container.appendChild(rowEl);
            }

            return container;
        },


        /**
         * Render bar chart component based on grid data.
         *
         * @param {Object}  data
         * @param {HTMLElement}  container
         *
         * @returns {HTMLElement}
         * @private
         */
        appendColumnsHeadersFromData: function(data, container) {

            var row = this.createElement('tr', '');
            var tableRenderer = this;

            data.columns.forEach(function(column) {
                var col = tableRenderer.createElement('th', '');
                col.innerHTML = column.header;
                row.appendChild(col);
            });
            container.appendChild(row);
            return container;
        },

        /**
         * Creates a HTML element.
         *
         * @param {string} element
         * @param {string} className
         *
         * @return {HTMLElement}
         */
        createElement: function(element, className) {
            className = typeof className !== 'undefined' ?  className : '';
            var el = Document.createElement(element);
            if (className.length > 0) {
                el.className = className;
            }
            return el;
        },


        /**
         * Returns the table created.
         *
         * @returns {HTMLElement}
         */
        getTable: function() {
            if (!this.table) {
                throw new ReferenceError('Unable to return a table, please call render before');
            }
            return this.table;
        }

    };

    return {
        renderTable: Namespace.render,
        getRows: Namespace.getRows
    };

})(document, Util, Util.Namespace.create("Js.Table"));