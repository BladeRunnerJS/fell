'use strict';

var Log = require('../src/Log');
var sinon = require('sinon');

describe('Log class', function() {
	var log, mockStore, store;

	beforeEach(function() {
		log = new Log();
		mockStore = sinon.mock({onLog:function(){}});
		store = mockStore.object;
		mockStore.expects('onLog').withArgs('no-such-args').never(); // fake expectation so we can register the store early
	});

	afterEach(function() {
		mockStore.verify();
	});

	function args() {
		return arguments;
	}

	it('can be used without throwing exceptions even if the log store has not been configured', function() {
		log.configure('info');
		log.info('hi');
	});

	describe('when newly created, and configured with level info', function() {
		beforeEach(function() {
			log.configure('info', {}, [store]);
		});

		it('makes all pertinent information available', function() {
			mockStore.expects('onLog').withArgs(log.DEFAULT_COMPONENT, 'info', args('logging message at level {0}', '@info')).once();
			log.info('logging message at level {0}', '@info');
		});

		it('does not output debug level messages.', function() {
			mockStore.expects('onLog').withArgs(sinon.match.any, 'fatal').once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'error').once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'warn').once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'info').once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'debug').never();

			log.Levels.forEach(function(level) {
				log[level]('some message');
			});
		});

		describe('and the level is changed to error,', function() {
			beforeEach(function() {
				log.changeLevel('error');
			});

			it('then only error and fatal messages are logged.', function() {
				mockStore.expects('onLog').withArgs(sinon.match.any, 'fatal').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'error').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'warn').never();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'info').never();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'debug').never();

				log.Levels.forEach(function(level) {
					log[level]('some message');
				});
			});

			it('when the level is changed back, then the right messages are logged.', function() {
				log.changeLevel('info');

				mockStore.expects('onLog').withArgs(sinon.match.any, 'fatal').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'error').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'warn').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'info').once();
				mockStore.expects('onLog').withArgs(sinon.match.any, 'debug').never();

				log.Levels.forEach(function(level) {
					log[level]('some message');
				});
			});
		});

		it('will provide a logger for a particular component configured to the same log level.', function() {
			mockStore.expects('onLog').withArgs(sinon.match.any, 'warn', args('hello at warn level')).once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'debug').never();

			var logger = log.getLogger('test');
			logger.warn('hello at warn level');
			logger.debug('hello at debug level (should not be logged).');
		});

		describe('when a second destination is added', function() {
			var mockStore2, store2;

			beforeEach(function() {
				mockStore2 = sinon.mock({onLog:function(){}});
				store2 = mockStore2.object;
				mockStore2.expects('onLog').withArgs('no-such-args').never(); // fake expectation so we can register the store early
				log.addDestination(store2);
			});

			afterEach(function() {
				mockStore2.verify();
			});

			it('then it should log to both.', function() {
				mockStore.expects('onLog').withArgs(sinon.match.any, 'warn', args('Hello')).once();
				mockStore2.expects('onLog').withArgs(sinon.match.any, 'warn', args('Hello')).once();

				log.warn('Hello');
			});

			it('and then the first is removed, it should only log to the new one.', function() {
				log.removeDestination(store);

				mockStore.expects('onLog').withArgs(sinon.match.any, 'warn', args('Hello')).never();
				mockStore2.expects('onLog').withArgs(sinon.match.any, 'warn', args('Hello')).once();

				log.warn('Hello');
			});
		});
	});

	describe('when configured with some components', function() {
		beforeEach(function() {
			log.configure('error', {
				'first.second.third': 'info',
				'first': 'fatal',
				'other.second': 'debug'
			}, [store]);
		});

		it('and a logger is requested for a child of a configured component, should provide a logger with the correct level set.', function() {
			mockStore.expects('onLog').withArgs('first.second.third.fourth', 'info', args('hi')).once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'debug').never();

			var logger = log.getLogger('first.second.third.fourth');
			logger.info('hi');
			logger.debug('hi');
		});

		it('and a logger is requested for a configured component, should provide a logger with the correct level set.', function() {
			mockStore.expects('onLog').withArgs('other.second', 'debug', args('hi')).once();

			var logger = log.getLogger('other.second');
			logger.debug('hi');
		});

		it('and a logger is requested for a component in between configurations, should provide a logger with the correct level set.', function() {
			mockStore.expects('onLog').withArgs('first.second', 'fatal', args('hi')).once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'error').never();

			var logger = log.getLogger('first.second');
			logger.error('hi');
			logger.fatal('hi');
		});

		it('and a logger is requested for a component that doesn\'t match a configuration, should provide a logger with the correct default level.', function() {
			mockStore.expects('onLog').withArgs('firsty', 'error', args('hi')).once();
			mockStore.expects('onLog').withArgs(sinon.match.any, 'warn').never();

			var logger = log.getLogger('firsty');
			logger.error('hi');
			logger.warn('hi');
		});
	});
});
