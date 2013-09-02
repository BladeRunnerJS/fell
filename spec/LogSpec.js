describe('A Log object', function(){
	var global = (function() {return this;})();
	var JsHamcrest = global.JsHamcrest || require('jshamcrest').JsHamcrest;
	JsHamcrest.Integration.jasmine();

	var fell = global.fell || require("../lib/fell");

	var Log = fell.Log, LogStore = fell.destination.LogStore;

	var store;

	beforeEach(function() {
		store = new LogStore();
		Log.clear();
		Log.addDestination(store);
	});

	describe('when newly created,', function() {
		it('starts with its level set to info.', function() {

			Log.Levels.forEach(function(level) {
				Log[level]("logging message at level {0}", level);
			});

			assertThat(store, LogStore.containsAll(
					LogStore.event('fatal', Log.DEFAULT_COMPONENT, ["logging message at level {0}", 'fatal']),
					LogStore.event('error', Log.DEFAULT_COMPONENT, ["logging message at level {0}", 'error']),
					LogStore.event('warn', Log.DEFAULT_COMPONENT, ["logging message at level {0}", 'warn']),
					LogStore.event('info', Log.DEFAULT_COMPONENT, ["logging message at level {0}", 'info'])
			));

			assertThat(store, not(LogStore.contains(LogStore.event('debug'))));
		});

		it('and the level is set to error, then only error and fatal messages are logged', function() {

			Log.configure({
				"[default]": "error"
			});

			Log.Levels.forEach(function(level) {
				Log[level]("logging message at level {0}", level);
			});

			assertThat(store, LogStore.containsAll(
					LogStore.event('fatal'),
					LogStore.event('error')
			));

			assertThat(store, not(LogStore.containsAny(
					LogStore.event('info'),
					LogStore.event('warn'),
					LogStore.event('debug')
			)));
		});
	});

});



