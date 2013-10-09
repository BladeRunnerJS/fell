// fell.js (modified 11:36:43)
define(function(require, exports, module) {
	module.exports = {
		Log: require('./Log'),
		RingBuffer: require('./RingBuffer'),
		Utils: require('./Utils'),
		destination: {
			LogStore: require('./destination/LogStore')
		}
	};
	
	if (typeof console !== "undefined") {
		var ConsoleLogDestination = require('./destination/ConsoleLog');
		module.exports.destination.ConsoleLog = new ConsoleLogDestination();
	}
});