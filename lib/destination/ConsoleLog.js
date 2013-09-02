function definition(Utils) {
	var CONSOLE_OUTPUT = {
		"fatal": console.error,
		"error": console.error,
		"warn": console.warn,
		"info": console.info,
		"debug": console.debug || console.log
	};

	function ConsoleLogDestination() {
		this.formatter = Utils.templateFormatter;
	};

	ConsoleLogDestination.prototype.onLog = function(time, component, level, data) {
		CONSOLE_OUTPUT[level].call(console, this.formatter(time, component, level, data));
	};

	return ConsoleLogDestination;
}

// Import and export that works in both browser and node.
(function(definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(['../LogUtils'], definition);
		} else {
			// we also have a define function that requires the module name and doesn't take a dependency list.
			define('fell/destination/ConsoleLog', function(require, module, exports) {
				var LogUtils = require('../LogUtils');
				module.exports = definition(LogUtils);
			});
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition(require('../LogUtils'));
	} else {
		// setting a global, as in e.g. a browser.
		if (this.fell === undefined) {
			this.fell = {
				destination: {}
			};
		}
		this.fell.destination.ConsoleLog = definition(this.fell.LogUtils);
	}
})(definition);