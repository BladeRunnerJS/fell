var global = (function() {return this;})();
var topLevelRequire = global['require'] || function(moduleName) {
	return global[moduleName];
};

function derelativise(context, path) {
	var result = (context === "" || path.charAt(0) !== '.') ? [] : context.split("/");
	var working = path.split("/");
	var item;
	while (item = working.shift()) {
		if (item === "..") {
			result.pop();
		} else if (item !== ".") {
			result.push(item);
		}
	}
	return result.join("/");
}

function realm() {
	var moduleDefinitions = {};
	var incompleteExports = {};
	var moduleExports = {};

	function define(id, definition) {
		if (id in moduleDefinitions) {
			throw new Error('Module ' + id + ' has already been defined.');
		}
		moduleDefinitions[id] = definition;
	}
	function require(context, id) {
		if (id.substring(0, 2) !== './' && id.substring(0, 3) !== '../') {
			return topLevelRequire.apply(null, Array.prototype.slice.call(arguments, 1));
		}
		id = derelativise(context, id);
		if (moduleExports[id] != null) { return moduleExports[id]; }
		if (incompleteExports[id] != null) {
			// there is a circular dependency, we do the best we can in the circumstances.
			return incompleteExports[id].exports;
		}
		var definition = moduleDefinitions[id];
		if (definition == null) { throw new Error("No definition for module " + id + " has been loaded."); }
		var module = { exports: {} };
		Object.defineProperty(module, 'id', {
			value: id, configurable: false, writable: false, enumerable: true
		});
		incompleteExports[id] = module;
		var definitionContext = id.substring(0, id.lastIndexOf("/"));
		var returnValue = definition.call(module, require.bind(null, definitionContext), module, module.exports);
		moduleExports[id] = returnValue || module.exports;
		delete incompleteExports[id];
		return moduleExports[id];
	}
	require.modules = moduleExports;
	return { define: define, require: require };
}

var libraryRealm = realm();
var define = libraryRealm.define;
var require = libraryRealm.require.bind(null, "");
