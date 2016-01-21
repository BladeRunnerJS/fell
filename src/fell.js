'use strict';

var Log = require('./Log');
var LogStore = require('./destination/LogStore');
var ConsoleLog = require('./destination/ConsoleLog');
var Utils = require('./Utils');

var fell = new Log();
fell.destination = {
	LogStore: LogStore,
	ConsoleLog: ConsoleLog,
	Utils: Utils
};
fell.Log = fell;

module.exports = fell;
