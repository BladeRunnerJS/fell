(function(name, definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(definition);
		} else {
			// some other define based function that needs the name.
			define(name, definition);
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition();
	} else {
		// setting a global, as in e.g. a browser.
		this[name] = definition();
	}
})