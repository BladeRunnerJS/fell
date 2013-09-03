"use strict";

function NOOP() {};
var Levels = require('./Levels');

function Logger(emitter, component) {
	this.component = component;
	this.emitter = emitter;
}

Levels.forEach(function(level) {
	Logger.prototype[level] = function() {
		this.emitter.trigger('log', Date.now(), this.component, level, arguments);
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

module.exports = Logger;