function LogDefinition(Emitter, ConsoleLogDestination) {
	"use strict";
	function NOOP() {};
	var DEFAULT_COMPONENT = "[default]";

	// Log Entry point //////////////////////////////////////////////////////////////////////////////

	function Log() {
		this.componentLoggers = {};
		this.config = null;
		this.defaultLevel = null;
		this._configTree = null;
		this.rootLogger = null;
		this.clear();
	}
	Emitter.mixInto(Log);
	Log.prototype.DEFAULT_COMPONENT = DEFAULT_COMPONENT;
	Log.prototype.getLogger = function(component) {
		if (arguments.length === 0) { component = DEFAULT_COMPONENT; }
		if (this.componentLoggers[component] !== undefined) {
			return this.componentLoggers[component];
		}
		var logger = new Logger(this, component);
		if (this.config[component]) {
			logger._setLevel(this.config[component]);
		} else {
			var level = this._configTree.getClosestAncestorValue(component);
			logger._setLevel(level);
		}
		this.componentLoggers[component] = logger;

		return logger;
	};
	Log.prototype.configure = function(defaultLevel, config) {
		if (arguments.length === 1 && typeof defaultLevel === 'object') {
			config = arguments;
			defaultLevel = "info";
		}
		config = config || {};
		this.config = config;
		this.defaultLevel = defaultLevel;
		this._configTree = new PrefixNode();

		for (var key in config) {
			this._configTree.setValue(key, config[key]);
		}
		for (var component in this.componentLoggers) {
			var level = this._configTree.getClosestAncestorValue(component, defaultLevel);
			this.componentLoggers[component]._setLevel(level);
		}
		this.rootLogger = this.getLogger();
	};
	Log.prototype.changeLevel = function(component, level) {
		var newConfig = Object.create(this.config);
		newConfig[component] = level;
		this.configure(newConfig);
	};
	Log.prototype.addDestination = function(logDestination, context) {
		if (arguments.length === 0) {
			logDestination = new ConsoleLogDestination();
		}

		if (context === undefined && typeof logDestination !== 'function') {
			context = logDestination;
			logDestination = context.onLog;
		}
		this.on('log', logDestination, context);
	};
	Log.prototype.removeDestination = function(logDestination, context) {
		if (arguments.length === 0) {
			logDestination = new ConsoleLogDestination();
		} else if (arguments.length === 1 && typeof logDestination !== 'function') {
			context = logDestination;
			logDestination = context.onLog;
		}
		this.off('log', logDestination, context);
	};
	Log.prototype.clear = function() {
		this.off();
		this.componentLoggers = {};
		var defaultConfig = {};
		defaultConfig[DEFAULT_COMPONENT] = "info";
		this.configure(defaultConfig);
	};
	var Levels = Log.prototype.Levels = ["fatal", "error", "warn", "info", "debug"];

	// Individual Logger control ////////////////////////////////////////////////////////////////////

	function Logger(emitter, component) {
		this.component = component;
		this.emitter = emitter;
	}

	Levels.forEach(function(level) {
		Logger.prototype[level] = function() {
			this.emitter.trigger('log', Date.now(), this.component, level, arguments);
		};
		Log.prototype[level.toUpperCase()] = level;
		Log.prototype[level] = function() {
			this.rootLogger[level].apply(this.rootLogger, arguments);
		};
	});

	Logger.prototype._setLevel = function(level) {
		var dontLogThisLevel = true;
		for (var i = Levels.length - 1; i >= 0; --i ) {
			if (Levels[i] === level) {
				dontLogThisLevel = false;
			}
			if (dontLogThisLevel) {
				this[Levels[i]] = NOOP;
			} else if (this.hasOwnProperty(level)) {
				delete this[Levels[i]];
			}
		}
	};


	// Configuration management /////////////////////////////////////////////////////////////////////

	var FIRST_PART = /(.*?)[\.\/]/;
	function PrefixNode() {
		this.children = {};
		this.data = null;
		this.nodeHasValue = false;
	}
	PrefixNode.prototype.getClosestAncestorValue = function(key, otherwise) {
		if (this.nodeHasValue) {
			otherwise = this.data;
		}
		if (key === "") {
			return otherwise;
		}
		var nextPartMatch = key.match(FIRST_PART);
		var nextPart = key;
		if (nextPartMatch !== null) {
			nextPart = nextPartMatch[1];
		}
		if (this.children[nextPart]) {
			return this.children[nextPart].getClosestAncestorValue(key.substring(nextPart.length + 1), otherwise);
		}
		return this.data;
	};
	PrefixNode.prototype.setValue = function(key, value) {
		if (arguments.length === 1) {
			value = key;
			key = undefined;
		}

		if (key === "" || key === null || key === undefined) {
			this.data = value;
			this.nodeHasValue = true;
			return;
		}
		var nextPartMatch = key.match(FIRST_PART);
		var nextPart = key;
		if (nextPartMatch !== null) {
			nextPart = nextPartMatch[1];
		}
		if (this.children[nextPart] === undefined) {
			this.children[nextPart] = new PrefixNode();
		}

		this.children[nextPart].setValue(key.substring(nextPart.length + 1), value);
	};


	return new Log();
}

// Import and export that works in both browser and node.
(function(definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(['Emitter', './destination/ConsoleLog'], definition);
		} else {
			// we also have a define function that requires the module name and doesn't take a dependency list.
			define('fell/Log', function(require, module, exports) {
				var Emitter = require('Emitter');
				var ConsoleLogDestination = require('./destination/ConsoleLog');
				exports.Log = definition(Emitter, ConsoleLogDestination);
			});
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition(require('Emitter'), require('./destination/ConsoleLog'));
	} else {
		// setting a global, as in e.g. a browser.
		if (this.fell === undefined) {
			this.fell = {
				destination: {}
			};
		}
		this.fell.Log = definition(this.Emitter, this.fell.destination.ConsoleLog);
	}
})(LogDefinition);