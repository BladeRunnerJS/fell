'use strict';

var Log = require('./Log');

module.exports = {
	Log: new Log(),
	RingBuffer: require('./RingBuffer'),
	Utils: require('./Utils'),
	destination: {
		LogStore: require('./destination/LogStore')
	}
};

if (typeof console !== 'undefined') {
	var ConsoleLogDestination = require('./destination/ConsoleLog');
	module.exports.destination.ConsoleLog = new ConsoleLogDestination();
}
