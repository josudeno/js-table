(function (Document, Util, Namespace) {
    'use strict';

    /**
     * @param {HTMLElement} table  The html table.
     * @param {Array} rows  the array containing the rows
     * @param {object} options  the options
     * @param {Namespace.HTMLElement} HTMLElementFactory  the html element factory
     * @param {Namespace.DomElement} domeElementsProvider  the html element provider
     * @constructor
     */
    Namespace.TableController = function (table, rows, options, HTMLElementFactory, domeElementsProvider) {
        
        if (!(HTMLElementFactory instanceof Util.Factory.HTMLElement)) {
            throw new ReferenceError('htmlHandler is not a valid html factory');
        }

        if (!(domeElementsProvider instanceof Util.Provider.DomElement)) {
            throw new ReferenceError('htmlHandler is not a valid html provider');
        }


        Util.TypeHelper.assertObject(options, "options");
        Util.TypeHelper.assertArray(rows, "rows");

        this.table       = table;
        this.rows        = this.globalRows = rows;
        this.HTMLElementProvider = domeElementsProvider;
        this.HTMLElementFactory = HTMLElementFactory;

        var haveOption = Object.hasOwnProperty.bind(options);
        var notEmptyString = function(string) {Util.TypeHelper.isStringEmpty(string)};
        var isString = function(string) {Util.TypeHelper.assertString(string); return true};
        var positiveInteger = function(integer) {Util.TypeHelper.assertPositiveInteger(integer); return true};

        haveOption('itemsPerPage')     && (positiveInteger(options.itemsPerPage    )) && (this.itemsPerPage     = options.itemsPerPage    );
        haveOption('displayedPages')   && (positiveInteger(options.displayedPages  )) && (this.displayedPages   = options.displayedPages  );
        haveOption('total')            && (positiveInteger(options.total           )) && (this.total            = options.total           );
        haveOption('searchDelay')      && (positiveInteger(options.searchDelay     )) && (this.searchDelay      = options.searchDelay     );
        haveOption('minTriggerLength') && (positiveInteger(options.minTriggerLength)) && (this.minTriggerLength = options.minTriggerLength);

        haveOption('previousText') && (isString(options.previousText)) && (this.previousText = options.previousText);
        haveOption('nextText')     && (isString(options.nextText    )) && (this.nextText     = options.nextText    );

        haveOption('pageClass')        && (notEmptyString()) && (this.pageClass        = options.pageClass       );
        haveOption('searchInputClass') && (notEmptyString()) && (this.searchInputClass = options.searchInputClass);
        haveOption('textSearching')    && (notEmptyString()) && (this.textSearching    = options.textSearching   );
        haveOption('textNoResults')    && (notEmptyString()) && (this.textNoResults    = options.textNoResults   );
        haveOption('textSearchPrompt') && (notEmptyString()) && (this.textSearchPrompt = options.textSearchPrompt);
        haveOption('textError')        && (notEmptyString()) && (this.textError        = options.textError       );
        haveOption('searchDivClass')   && (notEmptyString()) && (this.searchDivClass   = options.searchDivClass  );

        this.init();
    };



    Namespace.TableController.prototype = {
        /** @type {int} */
        itemsPerPage     : 10,
        /** @type {int} */
        displayedPages   : 5,
        /** @type {String} */
        pageClass        : 'page',
        /** @type {int} */
        total            : 0,
        /** @type {String} */
        previousText     : 'Previous',
        /** @type {String} */
        nextText         : 'Next',
        /** @type {String} */
        searchInputClass : 'search',
        /** @type {int} */
        searchDelay      : 300,
        /** @type {String} */
        textSearching    : 'Searching ...',
        /** @type {String} */
        textNoResults    : 'No results found.',
        /** @type {String} */
        textSearchPrompt : 'Start typing to search!',
        /** @type {String} */
        textError        : 'There was an error whilst searching.',
        /** @type {String} */
        searchDivClass   : 'div-search.',
        /** @type {int} */
        minTriggerLength : 3,
        /** @type {HTMLElement} */
        table: null,
        /** @type {int} */
        currentPage: 1,
        /** @type {int} Total pages from data or matched rows, changes depending on search */
        totalPages: 0,
        /** @type {int} Total pages from data */
        globalTotalPages: 0,
        /** @type {NodeList} */
        rowElements: null,
        /** @type {string} */
        attributePageN: 'pagenum',
        /** @type {Array} */
        rows: [],
        /** @type {Array} */
        globalRows: [],
        /** @type {Array} */
        matchedRows: [],
        /** @type {string} */
        activeClass: 'active',
        /** @type {HTMLElement} */
        paginationNav: null,
        /** @type {HTMLElement} */
        pageElements: null,
        /** @type {HTMLElement} */
        searchDiv: null,
        TYPE_STRING: 'string',
        
        
        /**
         * Initiates the table pagination elements.
         * @private
         */
        init: function()
        {
            this.rowElements = this.HTMLElementProvider.getElementByType(this.table, 'tr');
            this.records = (this.rows.length);

            this.globalTotalPages  = this.totalPages = Math.ceil(this.records / this.itemsPerPage);
            this.inited = true;

            this.searchDiv = this.createSearchDiv(this.table);
            this.addSearchInput(this.searchDiv);
            this.addNavigationItems(this.table);
            this.pageElements = this.HTMLElementProvider.getElementByType(this.paginationNav, 'li');
            this.renderDefaultText();
        },

        /**
         * Creates a search div and attaches to the container.
         * @param {HTMLElement} container
         * @returns {HTMLElement}
         * @private
         */
        createSearchDiv: function(container) {
            var searchDiv;
            searchDiv = this.HTMLElementFactory.createElement('div', this.searchDivClass);
            container.appendChild(searchDiv);
            return searchDiv;
        },

        /**
         * Adds a search input and links it to the search function.
         * @param {HTMLElement} container
         * @private
         */
        addSearchInput: function (container) {
            var tableController, searchInput;
            tableController = this;

            searchInput = this.HTMLElementFactory.createElement('input', this.searchInputClass);
            searchInput.addEventListener('keyup', function () { tableController.handleSearchInput(this) });
            container.appendChild(searchInput);
        },


        /**
         * Handles the event on the search input
         * @param {HTMLElement} triggeringElement
         */
        handleSearchInput: function (triggeringElement) {
            clearTimeout(this._lastTimeOut);
            this._lastTimeOut = setTimeout(this.search(triggeringElement), this.searchDelay);
        },

        /**
         * On key press
         * @param {HTMLElement} triggeringElement
         * @private
         */
        search: function (triggeringElement) {

            if (triggeringElement.value.length >= this.minTriggerLength) {
                this.renderSearching();
                this.doSearch(triggeringElement.value);
            } else {
                this.renderDefaultText();
                this.rows = this.globalRows;
            }
            this.totalPages = Math.ceil(this.rows.length / this.itemsPerPage);
            this.showPage(1);
        },


        /**
         * Do the actual search using the search value.
         * @param {string} searchValue
         * @private
         */
        doSearch: function (searchValue) {

            var matchedRows, cell, cellsLength;
            matchedRows = [];
            this.globalRows.forEach(function (row) {
                cellsLength = row.cells.length;
                for (var p = 0; p < cellsLength; p++) {
                    cell = row.cells[p];
                    if (typeof cell.value === 'string') {

                        if (cell.value.search(new RegExp(searchValue, "i")) !== -1) {
                            matchedRows.push(row);
                            break;
                        }
                    }

                }
            });

            if (matchedRows.length === 0) {
                this.renderNoResults();
            } else {
                this.renderMessage('');
            }
            this.rows = matchedRows;
        },


        /**
         * Render the default text.
         * @private
         */
        renderDefaultText: function () {
            this.renderMessage(this.textSearchPrompt);
        },

        /**
         * Render a message to indicate that it is searching.
         * @private
         */
        renderSearching: function () {
            this.renderMessage(this.textSearching);
        },

        /**
         * Render the no results message.
         * @private
         */
        renderNoResults: function () {
            this.renderMessage(this.textNoResults);
        },

        /**
         * Render a message to indicate that the was an error whilst searching.
         * @private
         */
        renderError: function () {
            this.renderMessage(this.textError);
        },

        /**
         * Render a message
         *
         * @param {String} message
         * @private
         */
        renderMessage: function (message) {
            var listItem = Document.createElement('div');
            listItem.textContent = message;
            var children = this.searchDiv.children;
            if (children.length > 1) {
                this.searchDiv.removeChild(children[1]);
            }
            this.searchDiv.appendChild(listItem);
        },


        /**
         * Returns the active data rows, matched if any or all of them by default.
         * @returns {Array}
         * @private
         */
        getRows: function () {
            var hasMatches = (this.matchedRows.length > 0);
            this.totalPages = hasMatches ? Math.ceil(this.matchedRows.length / this.itemsPerPage) : this.globalTotalPages;
            return hasMatches ? this.matchedRows : this.rows;
        },


        /**
         * Adds the navigation elements to the table.
         *
         * @param {HTMLElement} container
         * @private
         */
        addNavigationItems: function (container)
        {
            var tableController, ulEl;

            this.paginationNav = ulEl = this.HTMLElementFactory.createElement('ul', 'pagination') ;
            tableController = this;
            this.addDirectionElement(ulEl, this.previousText, function () { tableController.previous() });
            this.addDirectionElement(ulEl, this.nextText, function () { tableController.next() });
            this.showPage(1);
            container.appendChild(ulEl);
        },


        /**
         * Adds the directions elements, next previous.
         * @param {HTMLElement} ulElement
         * @param {string} text
         * @param {function} callback
         * @private
         */
        addDirectionElement: function (ulElement, text, callback) {
            var list, anchor;

            list = this.HTMLElementFactory.createElement('li', '');
            anchor = this.HTMLElementFactory.createElement('a', '');
            anchor.innerHTML = text;

            list.appendChild(anchor);
            list.className = 'navigation';
            list.addEventListener('click', callback);

            ulElement.insertBefore(list, ulElement.children[ulElement.children.length]);
        },

        /**
         * Adds the pages elements, list of page numbers and their links.
         * @param {HTMLElement} ulElement
         * @param {int} from  Page from to show
         * @param {int} to    Page to show
         * @private
         */
        drawPagesElements: function (ulElement, from, to) {
            var children, liEl;
            children = ulElement.children;

            /** Removes all the elements except the Previous and Next button */
            while (children.length > 2) {
                ulElement.removeChild(children[1]);
            }

            for (var i = from; i <= to; i++) {
                liEl = this.createPageListElement(i, '');
                ulElement.insertBefore(liEl, ulElement.children[ulElement.children.length-1]);
            }

            //Adds the first page button
            if (from > 1) {
                liEl = this.createPageListElement(1, '...');
                ulElement.insertBefore(liEl, ulElement.children[1]);
            }

            //Adds the last page button
            if (to < this.totalPages) {
                liEl = this.createPageListElement(this.totalPages, '...');
                ulElement.insertBefore(liEl, ulElement.children[ulElement.children.length-1]);
            }

        },

        /**
         * Creates a page list element with the given number
         * @param {int} pageNumber
         * @param {string} extraText
         * @private
         */
        createPageListElement: function(pageNumber, extraText) {
            var liEl, anchor, tableController;
            tableController = this;

            liEl = this.HTMLElementFactory.createElement('li', '');
            anchor = this.HTMLElementFactory.createElement('a', '');

            //We set the attribute pagenum to the current page.
            liEl.setAttribute(this.attributePageN, pageNumber);
            liEl.className = this.pageClass;
            anchor.innerHTML = extraText+pageNumber;
            liEl.appendChild(anchor);
            liEl.addEventListener('click', function () {tableController.goToPage(this)});
            return liEl;
        },

        /**
         * Shows the previous page
         */
        previous: function() {
            if (this.currentPage > 1) {
                this.showPage(this.currentPage - 1);
            }
        },

        /**
         * Shows the next page.
         */
        next: function() {
            if (this.currentPage < this.totalPages) {
                this.showPage(this.currentPage + 1);
            }
        },

        /**
         * Called when clicking in a page number list element.
         *
         * @param {HTMLElement} triggeringElement
         * @private
         */
        goToPage: function(triggeringElement) {
            this.showPage(parseInt(triggeringElement.getAttribute(this.attributePageN)));

        },

        /**
         * Shows the page passed by parameter.
         * @param {int} pageNumber
         */
        showPage: function (pageNumber) {

            var oldPageActive, newPageAnchor, from, to, fromPage, toPage;
            toPage = pageNumber+2;
            toPage = toPage > this.totalPages ? this.totalPages : toPage;
            fromPage = (toPage-this.displayedPages)+1;
            fromPage = fromPage <= 0 ? 1 : fromPage;

            this.drawPagesElements(this.paginationNav, fromPage, toPage);

            oldPageActive = this.getElementByAttributeAndValue(this.attributePageN, this.currentPage.toString());

            if (oldPageActive !== null) {
                oldPageActive.className = '';
            }

            this.currentPage = pageNumber;
            newPageAnchor = this.getElementByAttributeAndValue(this.attributePageN, this.currentPage.toString());
            if (newPageAnchor !== null) {
                newPageAnchor.className = this.activeClass;
            }

            from = (pageNumber - 1) * this.itemsPerPage;
            to = from + this.itemsPerPage - 1;
            this.showRecords(from, to);
        },


        /**
         * Show the records for the given range
         * @param {int} from
         * @param {int} to
         * @private
         */
        showRecords: function (from, to) {

            this.emptyTableContent();
            var rowElement, x, i, tdElements, rowData, t;

            // x starts from 1 to skip table header row
            x = 1;

            for (i = from; i <= to; i++) {

                rowData = this.getRows()[i];
                rowElement = this.rowElements[x];
                tdElements = rowElement.children;

                t = 0;

                if (typeof rowData === 'undefined') {
                    break;
                }
                rowData.cells.forEach(function(cell) {
                    var value = cell.value;
                    if (cell.valueType === 'datetime') {
                        value = Date(value);
                    }
                    tdElements[t].innerHTML = value;
                    t++;
                });

                x++;
            }
        },


        /**
         * Empties the table content. Deleting the cell inner html.
         * @private
         */
        emptyTableContent: function () {
            var trElements, tdElements;
            for (var i = 0; i < this.rowElements.length; i++) {
                trElements = this.rowElements[i];
                tdElements = trElements.children;
                for (var x = 0; x < tdElements.length; x++) {
                    tdElements[x].innerHTML = '';
                }
            }
        },


        /**
         * Gets a dom element by attribute and value.
         *
         * @param {string} attribute
         * @param {string} value
         * @returns {Element}
         */
        getElementByAttributeAndValue: function (attribute, value) {
            Util.TypeHelper.assertString(attribute);
            Util.TypeHelper.assertString(value);
            return Document.querySelector('*['+ attribute + '="' + value + '"]');
        },

       
    };

    return {
        nextAction: Namespace.TableController.next,
        previousAction: Namespace.TableController.prev
    };

})(document, Util, Util.Namespace.create("Table"));
