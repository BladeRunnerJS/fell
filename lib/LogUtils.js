"use strict";

var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function format(pattern, date) {
	if (date == null) { date = new Date(); }
	var dayNo = date.getDay();
	var dateNo = date.getDate();
	var month = date.getMonth();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var sec = date.getSeconds();
	var millis = date.getMilliseconds();
	var fullYear = date.getFullYear();

	return pattern
			.replace(/HH/g, padBefore(hour, 2, "0"))
			.replace(/H/g, hour)
			.replace(/mm/g, padBefore(minute, 2, "0"))
			.replace(/m/g, minute)
			.replace(/ss/g, padBefore(sec, 2, "0"))
			.replace(/s/g, sec)
			.replace(/SSS/g, padBefore(millis, 3, "0"))
			.replace(/S/g, millis)
			.replace(/yyyy/g, fullYear)
			.replace(/yy/g, String(fullYear).substring(2))
			.replace(/dd/g, padBefore(dateNo, 2, "0"))
			.replace(/d/g, dateNo)
			.replace(/MMMM/g, MONTH_NAMES[month])
			.replace(/MMM/g, MONTH_NAMES[month].substring(0, 3))
			.replace(/MM/g, padBefore(month + 1, 2, "0"))
			.replace(/M/g, month + 1)
			.replace(/EEEE/g, DAY_NAMES[dayNo])
			.replace(/EEE/g, DAY_NAMES[dayNo].substring(0, 3));
}

function padAfter(val, length, paddingCharacter) {
	val = String(val);
	if (val.length >= length) return val;
	var result = val + (new Array(length).join(paddingCharacter) + paddingCharacter);
	return result.substring(0, length);
}

function padBefore(val, length, paddingCharacter) {
	val = String(val);
	if (val.length >= length) return val;
	var result = (new Array(length).join(paddingCharacter) + paddingCharacter) + val;
	return result.substring(result.length - length);
}

function interpolate(template) {
	var message = String(template);
	for (var i = 1, len = arguments.length; i < len; ++i) {
		message = message.replace("{"+(i-1)+"}", String(arguments[i]));
	}
	return message;
}

function templateFormatter(time, component, level, data) {
	var date = new Date(time);
	return format("yyyy-MM-dd HH:mm:ss.SSS", date)
			+ " ["
			+ padAfter(level, 5, " ")
			+ "] ["
			+ padAfter(component, 18, " ")
			+ "] : "
			+ interpolate.apply(null, data);
}

// see http://en.wikipedia.org/wiki/ANSI_escape_code
// this is to make the output nicer in the node console.
var colors = {
	black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7
};

function style(str, style) {
	var startCodes = [];
	var endCodes = [];
	for (var key in style) {
		if (key === 'color' || key === 'background') {
			var base = (key === 'color' ? 30 : 40);
			var styleParts = style[key].split(" ");
			var color = styleParts[styleParts.length - 1];
			var isBright = false;
			if (styleParts[0] === 'bright') {
				isBright = true;
			}
			startCodes.push("\x1B[" + (base + colors[color]) + (isBright ? ";1m" : "m"));
			endCodes.push("\x1B[" + (base + 9) + (isBright ? ";22m" : "m"))
		}
	}
	return startCodes.join("") + str + endCodes.reverse().join("");
}

var LEVEL_STYLES = {
	"fatal": {color: "bright white", background: "bright red"},
	"error": {color: "bright red"},
	"warn": {color: "bright yellow"},
	"info": {},
	"debug": {color: "green"}
};

function ansiFormatter(time, component, level, data) {
	var date = new Date(time);
	return style(format("yyyy-MM-dd HH:mm:ss.SSS", date)
				+ " [" + padAfter(level, 5, " ")	+ "] ["
				+ padAfter(component, 18, " ") + "]", LEVEL_STYLES[level])
			+ " : " + interpolate.apply(null, data);
}

function allowAll(time, component, level, data) {
	return true;
}

module.exports = {
	format: format,
	padBefore: padBefore,
	padAfter: padAfter,
	interpolate: interpolate,
	templateFormatter: templateFormatter,
	ansiFormatter: ansiFormatter,
	allowAll: allowAll
};