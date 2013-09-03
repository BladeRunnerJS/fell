"use strict";

var FIRST_PART = /(.*?)[\.\/]/;
function PrefixNode() {
	this.children = {};
	this.data = null;
	this.nodeHasValue = false;
}

PrefixNode.prototype.getClosestAncestorValue = function(key, otherwise) {
	if (this.nodeHasValue) {
		otherwise = this.data;
	}
	if (key === "") {
		return otherwise;
	}
	var nextPartMatch = key.match(FIRST_PART);
	var nextPart = key;
	if (nextPartMatch !== null) {
		nextPart = nextPartMatch[1];
	}
	if (this.children[nextPart]) {
		return this.children[nextPart].getClosestAncestorValue(key.substring(nextPart.length + 1), otherwise);
	}
	return otherwise;
};

PrefixNode.prototype.setValue = function(key, value) {
	if (arguments.length === 1) {
		value = key;
		key = undefined;
	}

	if (key === "" || key === null || key === undefined) {
		this.data = value;
		this.nodeHasValue = true;
		return;
	}
	var nextPartMatch = key.match(FIRST_PART);
	var nextPart = key;
	if (nextPartMatch !== null) {
		nextPart = nextPartMatch[1];
	}
	if (this.children[nextPart] === undefined) {
		this.children[nextPart] = new PrefixNode();
	}

	this.children[nextPart].setValue(key.substring(nextPart.length + 1), value);
};

module.exports = PrefixNode;