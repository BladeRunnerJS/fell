module.exports = {
	Log: require('./Log'),
	RingBuffer: require('./RingBuffer'),
	Utils: require('./Utils'),
	destination: {
		ConsoleLog: require('./destination/ConsoleLog'),
		LogStore: require('./destination/LogStore')
	}
};