---
layout: main
permalink: /index.html
title: fell logging
---

<script type="text/javascript" src="node_modules/Emitter/lib/Emitter.js"></script>
<script type="text/javascript" src="http://caplin.github.io/Emitter/lib/Emitter.js"></script>

<script type="text/javascript" src="target/single/fell.js"></script>

fell
====

A logging library that works in node and the browser.

* This document is available nicely formatted [here](http://caplin.github.io/fell).
* Tests are [here](http://caplin.github.io/fell/spec).
* Source code is [here](https://github.com/caplin/fell).
* JSDoc is [here](http://caplin.github.io/fell/doc) (still a work in progress).

The rendered form of this document includes the fell script so you can open
a console and try it immediately.

Aims
----

* Very low cost when logging at a level not in use.
* Friendly to unit testing.
* Allows you to log at different levels from within different pieces of code.
* Works in both node.js and the browser.

Usage
-----

###  Getting the Log object.

Start by getting the Log object.

```javascript

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

```javascript

   Log.info("Log messages by default have {0} replaced {1}.",
               "numbers surrounded by curly braces",
               "by their arguments");
   Log.warn("The levels supported are fatal, error, warn, info and debug");
```

### Specific Loggers

You can get more fined grained control if you log to specified loggers within your classes.

```javascript

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

```javascript

    Log.configure('error', {
        'mymodule': 'info',
        'mymodule.some.hierarchy': 'fatal'
    });
```

This tells the logging system to use 'error' as the log level for anything that is not a part of
'mymodule'.  In the earlier example, 'mymodule.MyClass' would have been logged at 'info' level,
any logger for 'mymodule.some.hierarchy' or lower would only log fatal log messages.