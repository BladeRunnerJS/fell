module.exports = {
	Log: new require('./Log'),
	destination: {
		ConsoleLog: require('./destination/ConsoleLog'),
		LogStore: require('./destination/LogStore')
	}
};