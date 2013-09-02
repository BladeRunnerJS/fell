function definition(Utils) {
	"use strict";

	function LogStore(maxRecords) {
		this.maxRecords = maxRecords;
		this.logRecords = maxRecords ? new Utils.SlidingWindow(maxRecords) : [];
	}

	LogStore.prototype.onLog = function(time, component, level, data) {
		this.logRecords.push({
			time: time,
			component: component,
			level: level,
			data: data,
			toString: logRecordToString
		});
	};

	LogStore.prototype.some = function(match) {
		return this.logRecords.some(match);
	}

	LogStore.prototype.allMessages = function() {
		var result = [];
		this.logRecords.forEach(function(record) {
			result.push(record);
		});
		return result;
	};

	LogStore.prototype.toString = function() {
		return "Stored Log Messages:\n\t" + this.allMessages().join("\n\t");
	};

	// JSHamcrest integration.
	var global = Function("return this")();
	if (global.both && global.hasMember && global.truth && global.allOf && global.anyOf) {
		LogStore.containsAll = function() {
			var items = [];
			for (var i = 0; i < arguments.length; i++) {
				items.push(LogStore.contains(arguments[i]));
			}
			return allOf(items);
		};
		LogStore.containsAny = function() {
			var items = [];
			for (var i = 0; i < arguments.length; i++) {
				items.push(LogStore.contains(arguments[i]));
			}
			return anyOf(items);
		};
		LogStore.contains = function(matcher) {
			var baseMatcher = truth();
			baseMatcher.matches = function(actual) {
				// Should be a LogStore
				if (!(actual instanceof LogStore)) {
					return false;
				}

				for (var i = 0; i < actual.logRecords.length; i++) {
					if (matcher.matches(actual.logRecords[i])) {
						return true;
					}
				}
				return false;
			};
			baseMatcher.describeTo = function(description) {
				description.append('there has been a log event ').appendDescriptionOf(matcher);
			}
			return baseMatcher;
		};
		LogStore.event = function logEvent(level, component, data, time) {
			var matcher = both(hasMember('level', level));
			if (arguments.length > 1) {
				matcher = matcher.and(hasMember('component', component));
			}
			if (arguments.length > 2) {
				matcher = matcher.and(hasMember('data', data));
			}
			if (arguments.length > 3) {
				matcher = matcher.and(hasMember('time', time));
			}
			return matcher;
		};


	}

	function logRecordToString() {
		return Utils.templateFormatter(this.time, this.component, this.level, this.data);
	}

	return LogStore;
}

// Import and export that works in both browser and node.
(function(definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(['../LogUtils'], definition);
		} else {
			// we also have a define function that requires the module name and doesn't take a dependency list.
			define('fell/destinations/LogStore', function(require, module, exports) {
				var LogUtils = require('../LogUtils');
				module.exports = definition(LogUtils);
			});
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition(require('../LogUtils'));
	} else {
		if (this.fell === undefined) {
			this.fell = {
				destination: {}
			};
		}
		// setting a global, as in e.g. a browser.
		this.fell.destination.LogStore = definition(this.fell.LogUtils);
	}
})(definition);