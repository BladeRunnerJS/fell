// Import and export that works in both browser and node.

if (typeof define === "function") {

	function addToExportsFromRequire(exports) {
		exports.Log = require('./Log');
		exports.destination = {
			ConsoleLog: require('./destination/ConsoleLog'),
			LogStore: require('./destination/LogStore')
		};
	}

	if (define.amd) {
		// AMD knows the name itself.
		define(['./Log', './destination/ConsoleLog', './destination/LogStore'], function (Log, ConsoleLog, LogStore) {
			return {
				Log: Log,
				destination: {
					ConsoleLog: ConsoleLog,
					LogStore: LogStore
				}
			};
		});
	} else {
		// we also have a define function that requires the module name and doesn't take a dependency list.
		define('fell', function(require, module, exports) {
			addToExportsFromRequire(exports);
		});
	}
} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	// node style commonJS.
	addToExportsFromRequire(exports);
} else {
	// setting a global, as in e.g. a browser.
	if (this.fell === undefined) {
		this.fell = {
			destination: {}
		};
	}
}
