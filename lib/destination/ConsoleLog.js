"use strict";

var Utils = require('../LogUtils');

var global = Function("return this;")();
var defaultFormatter = (global.process && global.process.stdout && Boolean(global.process.stdout.isTTY))
		? Utils.ansiFormatter : Utils.templateFormatter;

var CONSOLE_OUTPUT = {
	"fatal": console.error,
	"error": console.error,
	"warn": console.warn,
	"info": console.info,
	"debug": console.debug || console.log
};

function ConsoleLogDestination(filter, formatter) {
	this.filter = filter || Utils.allowAll;
	this.formatter = formatter || defaultFormatter;
};

ConsoleLogDestination.prototype.onLog = function(time, component, level, data) {
	if (this.filter(time, component, level, data)) {
		this.output(level, this.formatter(time, component, level, data));
	}
};

ConsoleLogDestination.prototype.output = function(level, message) {
	CONSOLE_OUTPUT[level].call(console, message);
};

module.exports = ConsoleLogDestination;