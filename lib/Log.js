"use strict";

var DEFAULT_COMPONENT = "[default]";
var ConsoleLogDestination = require('./destination/ConsoleLog');
var Emitter = require('Emitter');
var Logger = require('./Logger');
var Levels = require('./Levels');
var PrefixNode = require('./PrefixNode');

function Log() {
	this.componentLoggers = null, this.config = null, this.defaultLevel = null;
	this._configTree = null, this.rootLogger = null;

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
	var level = this._configTree.getClosestAncestorValue(component, this.defaultLevel);
	logger._setLevel(level);
	this.componentLoggers[component] = logger;

	return logger;
};

Log.prototype.configure = function(defaultLevel, config, destinations) {
	if (arguments.length === 1 && typeof defaultLevel === 'object') {
		config = arguments[0];
		defaultLevel = "info";
	}
	config = config || {};
	this.off();
	destinations = destinations || (typeof console !== 'undefined' ? [new ConsoleLogDestination()] : []);
	this.config = config;
	this.defaultLevel = defaultLevel;
	this._refreshConfig();
	this.rootLogger = this.getLogger();
	for (var i = 0; i < destinations.length; ++i) {
		this.addDestination(destinations[i]);
	}
};

Log.prototype.changeLevel = function(component, level) {
	if (arguments.length === 1) {
		this.defaultLevel = arguments[0];
	} else {
		this.config[component] = level;
	}
	this._refreshConfig();
};

Log.prototype.addDestination = function(logDestination, context) {
	if (context === undefined && typeof logDestination !== 'function') {
		context = logDestination;
		logDestination = context.onLog;
	}
	this.on('log', logDestination, context);
};

Log.prototype.removeDestination = function(logDestination, context) {
	if (arguments.length === 1 && typeof logDestination !== 'function') {
		context = logDestination;
		logDestination = context.onLog;
	}
	this.off('log', logDestination, context);
};

Log.prototype.clear = function() {
	this.off();
	this.componentLoggers = {};
	var defaultConfig = {};
	this.configure("info", defaultConfig);
};

Log.prototype._refreshConfig = function() {
	this._configTree = new PrefixNode();
	for (var key in this.config) {
		this._configTree.setValue(key, this.config[key]);
	}
	for (var component in this.componentLoggers) {
		var level = this._configTree.getClosestAncestorValue(component, this.defaultLevel);
		this.componentLoggers[component]._setLevel(level);
	}
};

Log.prototype.Levels = Levels;

Levels.forEach(function(level) {
	Log.prototype[level.toUpperCase()] = level;

	// Convenience methods to log to the root logger.
	Log.prototype[level] = function() {
		this.rootLogger[level].apply(this.rootLogger, arguments);
	};
});

module.exports = new Log();