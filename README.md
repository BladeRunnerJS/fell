# fell

A logging library that works in node and the browser.

[![Build Status](https://travis-ci.org/BladeRunnerJS/fell.png)](https://travis-ci.org/BladeRunnerJS/fell)

The rendered form of this document includes the fell script so you can open
a console and try it immediately.

## Aims

* Very low cost when logging at a level not in use.
* Friendly to unit testing.
* Allows you to log at different levels from within different pieces of code.
* Quick and easy to get started with.
* Works in both Node.js and the browser.

## Usage

In a web browser, you'll need to include [emitr.js](https://github.com/BladeRunnerJS/emitr/blob/master/dist/emitr.js) and [fell.js](dist/fell.js).

The following lines will pull the libraries from github. For a proper deployment, you should
download them or check them out of github.

```
<script type="text/javascript" src="https://github.com/BladeRunnerJS/emitr/blob/master/dist/emitr.js"></script>
<script type="text/javascript" src="https://github.com/BladeRunnerJS/fell/blob/master/dist/fell.js"></script>
```

In Node.js, add fell to your package.json dependencies:

```shell
npm install --save fell
```

###  Getting the Log object.

Start by getting the Log object.

```js
// In the browser
var Log = fell.Log;

// In node
var Log = require('fell').Log;

// Either:
var Log = typeof fell !== 'undefined' ? fell.Log : require('fell').Log;
```

### The Default Logger

The default configuration has it outputting to the console (if one is available), so you can start
using it immediately:

```js
Log.info("Log messages by default have {0} replaced {1}.",
	"numbers surrounded by curly braces", "by their arguments");
Log.warn("The levels supported are fatal, error, warn, info and debug");
```

### Specific Loggers

You can get more finely grained control if you log to specified loggers within your modules or
classes.

```js
function MyClass() {
	this.log = Log.getLogger('mymodule.MyClass');
}

MyClass.prototype.doAThing = function() {
	this.log.warn("The thing that MyClass does is potentially dangerous!");
};

var myObj = new MyClass();
myObj.doAThing();
```

### Configuration

To take advantage of this control, you can configure particular loggers to log at particular levels.

```js
Log.configure('error', {
	'mymodule': 'info',
	'mymodule.some.hierarchy': 'fatal'
});
```

You can set up your logging by calling configure at the start of your program.  It takes up to three
arguments.  The first argument is the default log level that will be done for all loggers that don't
have more specific configuration.

The second argument is a map containing logger names to the levels that they should log at.  This
is interpreted hierarchically, so in the above example the logger `mymodule.MyClass` will log at
level `info`, since it matches the `mymodule` configuration.  The logger `mymodule.some.hierarchy`
will log at level `fatal`, as will any loggers with names that start `mymodule.some.hierarchy.`.

The third argument is an array of destinations that log events should be routed too.  If you don't
pass anything (as in the above example), this will default to an array containing only a logger that
outputs to the console object in environments that support this.

Calling `Log.configure` clears the state of the logger, so the levels, configuration and log
destinations are all reset.

If you want to modify the logging while in use you can use methods specifically for that:

```js
// Changes the log level for things not configured specifically.
Log.changeLevel('error');

// Changes the log level for mymodule.MyClass and things below it.
Log.changeLevel('mymodule.MyClass', 'warn');

// Adds a new destination that stores the most recent 10 log events.
var store = new fell.destination.LogStore(10);
Log.addDestination(store);

// Removes the previously added destination.
Log.removeDestination(store);
```

## Testing

Care must be taken when testing for log messages in order to avoid writing fragile tests. To help with this, we recommend the use of a mocking library like [JsMockito](http://jsmockito.org/).

Here's an example of some logging code that you might want to test:

```js
var Log = require('fell').Log;

function MyObject(parameter) {
	this.log = Log.getLogger('mymodule.MyObject');
	this.log.info(MyObject.LOG_MESSAGES.INITIALISING, MyObject.version, parameter);
}

MyObject.LOG_MESSAGES = {
	INITIALISING: 'Initialising MyObject, version {0}, with parameter {1}.'
}

MyObject.version = '1.2.3';

module.exports = MyObject;
```

and the corresponding test code to verify it:

```js
var MyObject = require('..');
var Log = require('fell').Log;
var JsMockito = require('jsmockito').JsMockito;
var JsHamcrest = require('jsmockito/node_modules/jshamcrest').JsHamcrest;

describe('My object', function() {
	var store;

	beforeEach(function() {
		JsMockito.Integration.importTo(global);
		JsHamcrest.Integration.copyMembers(global);

		store = mock({onLog:function(){}});
		Log.configure('info', {}, [store]);
	});

	it('logs at info level during construction with its version and the parameter', function() {
		var myObj = new MyObject(23);

		verify(store, once()).onLog('mymodule.MyObject', 'info',
			[MyObject.LOG_MESSAGES.INITIALISING, MyObject.version, 23]);

		// or if the only thing we really care about is that the parameter
		// is in the log message:
		 verify(store, once()).onLog(anything(), anything(), hasItem(23));
	});
});
```
