(function () {

	function loadJSON(callback) {

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', 'tableData2.json', true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);

	}

	// Call to function with anonymous callback
	loadJSON(function(data) {

		var htmlFactory, htmlProvider, tableRenderer, options, tableController;

		htmlProvider = new Util.Provider.DomElement();
		htmlFactory = new Util.Factory.HTMLElement();


		tableRenderer = new Table.Renderer(
			document.getElementById('myTable'),
			{tableClass: 'dataTable', recordsToShow: 5},
			htmlFactory
		);
		tableRenderer.render(JSON.parse(data));


		options = {itemsPerPage: 5};

		tableController = new Table.TableController(
			tableRenderer.getTable(),
			tableRenderer.getRows(),
			options,
			htmlFactory,
			htmlProvider
		);

		tableController.showPage(1);
		tableRenderer = null;
		htmlFactory = null;
	});

})();


