var fs = require('fs');
var path = require('path');
var FSVisitor = require('./FSVisitor');

var libraryDir = path.resolve(__dirname, "..");
var packageJson = require('../package.json');

var libraryName = packageJson.name;
var srcRoot = path.resolve(libraryDir, "lib");
var newestFileTime = null;

var moduleSystemFileName = path.join(__dirname, "ModuleSystem.js");
var moduleSystemContent = fs.readFileSync(moduleSystemFileName, { encoding: 'utf8' });
newestFileTime = fs.statSync(moduleSystemFileName).mtime.getTime();

var result = [
	fs.readFileSync(path.join(__dirname, "definitionFunction.js"), {encoding: 'utf8'}) +
			"('" + libraryName +"', function() {",
	"\t" + moduleSystemContent.replace(/\n/g, '\n\t')
];

function fullPathToModuleName(fullPath) {
	var relativePath = path.relative(libraryDir, fullPath);
	var moduleName = relativePath.replace(/\.js$/, '').split(path.sep).join("/");
	return moduleName;
}

var tree = new FSVisitor(true);
tree.on("file", function(dir, name, stat, content) {
	if (stat.mtime.getTime() > newestFileTime) {
		newestFileTime = stat.mtime.getTime();
	}

	var fullPath = path.join(dir, name);
	var relativePath = path.relative(srcRoot, fullPath);
	var moduleName = fullPathToModuleName(fullPath);

	result.push("");
	result.push("\t// " + relativePath + " (modified " + stat.mtime.toLocaleTimeString() + ")");
	result.push("\tdefine('" + moduleName + "', function(require, module, exports) {");
	result.push("\t\t" + content.replace(/\n/g, '\n\t\t'));
	result.push("\t});");
});
tree.visit(path.dirname(srcRoot), path.basename(srcRoot));

result.unshift("// " + new Date(newestFileTime).toISOString());
result.unshift("// " + packageJson.name + " v" + packageJson.version + " packaged for the browser.");

result.push("");
result.push("\treturn require('./" + fullPathToModuleName(packageJson.main) + "');");
result.push("});");

fs.writeFileSync(path.resolve(libraryDir, 'target', libraryName + ".js"), result.join("\n"));