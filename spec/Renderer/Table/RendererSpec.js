describe("Renderer", function () {

	/**
	 * @type {Vision.Renderer} container
	 */
	var container, data;

	data = {
		columns : [
			{header: "Text"},
			{header: "dateStamp"}
		],
		rows : [
			cells = [
				{value: "The check out was ok, the food quality good, but nothing extraordinary. "},
				{valueType: "string"}
			],
			cells = [
				{value: "The check out was ok, the food quality good, but nothing extraordinary. "},
				{valueType: "string"}
			]
		]
	};


	it('should reject invalid html elements on construct', function () {

		function shouldThrowWith(table) {
			expect(function () {
				container = new Vision.Renderer(table, {}, new Vision.HTMLHandler());
			}).toThrowError(ReferenceError);
		}

		shouldThrowWith('<thead></thead>');
		shouldThrowWith('<body></body>');
		shouldThrowWith('<video></video>');
		shouldThrowWith('<input/>');
		shouldThrowWith('<span></span>');
		shouldThrowWith('<div></div>');
		shouldThrowWith("");
		shouldThrowWith("table");
		shouldThrowWith(2);
	});

});