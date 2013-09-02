// Import and export that works in both browser and node.
(function(definition) {
	if (typeof define === "function") {
		if (define.amd) {
			// AMD knows the name itself.
			define(definition);
		} else {
			// we also have a define function that requires the module name and doesn't take a dependency list.
			define('fell/LogUtils', function(require, module, exports) {
				module.exports = definition();
			});
		}
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition();
	} else {
		if (this.fell === undefined) {
			this.fell = {
				destination: {}
			};
		}
		// setting a global, as in e.g. a browser.
		this.fell.LogUtils = definition();
	}
})(function definition() {
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
				+ padAfter(component, 25, " ")
				+ "] : "
				+ interpolate.apply(null, data);
	}


	/**
	 * Creates a SlidingWindow, which allows a maximum number of items to be stored.
	 *
	 * @param nSize {Number} The maximum size of this window. This must be an integer larger than 0.
	 * @constructor
	 */
	function SlidingWindow(nSize) {
		this._checkSize(nSize);

		this.m_nMaxsize = nSize;
		this.clear();
	}
	/**
	 * Clears all items from this SlidingWindow and resets it.
	 */
	SlidingWindow.prototype.clear = function () {
		this.m_pBuffer = new Array(this.m_nMaxsize);
		this.m_nNext = 0;
		this.m_bFilled = false;
	};
	/**
	 * @return the item most recently added into this SlidingWindow, or null if no items have been added.
	 */
	SlidingWindow.prototype.newest = function () {
		var oNewest = null;
		var nIndex = (this.m_nNext + this.m_nMaxsize - 1) % this.m_nMaxsize;
		if (this.m_bFilled || nIndex < this.m_nNext) {
			oNewest = this.m_pBuffer[nIndex];
		}
		return oNewest;
	};
	/**
	 * @return the oldest item that is still in this SlidingWindow or null if no items have been added.
	 */
	SlidingWindow.prototype.oldest = function () {
		var oOldest = null;
		if (this.m_bFilled) {
			oOldest = this.m_pBuffer[this.m_nNext];
		}
		else if (this.m_nNext > 0) {
			oOldest = this.m_pBuffer[0];
		}
		return oOldest;
	};
	/**
	 * @param n {Number} the index of the item to be returned.
	 * @return the nth oldest item that is stored or undefined if the index is larger than the number of items stored.
	 */
	SlidingWindow.prototype.get = function (n) {
		if (n >= this.m_nMaxsize) return undefined;
		if (this.m_bFilled) {
			return this.m_pBuffer[(this.m_nNext + n) % this.m_nMaxsize];
		}
		return this.m_pBuffer[n];
	};
	/**
	 * Adds an item into the end of this sliding window, possibly
	 * pushing an item out of the window in the process.
	 *
	 * @param {Object} oObject an item to add into this window.
	 * @return the item that was pushed out of the window or null if the window is not full.
	 *
	 */
	SlidingWindow.prototype.push = function (oObject) {
		var oOusted = null;
		if (this.m_bFilled) {
			oOusted = this.oldest();
		}

		this._changeWindow(oObject, oOusted);

		return oOusted;
	};
	/**
	 * Changes the size of a SlidingWindow.
	 *
	 * This operation should not be expected to be performant; do not do it often.
	 *
	 * If the new size is smaller than the number of items in this window, this
	 * operation may cause some objects to be pushed out of the window.
	 *
	 * @param {Number} nNewSize the new size the window should take up. Must be a positive integer.
	 */
	SlidingWindow.prototype.setSize = function (nNewSize) {
		this._checkSize(nNewSize);

		if (this.m_nMaxsize == nNewSize) {
			return;
		}
		var tmpWindow = new SlidingWindow(nNewSize);
		this.forEach(tmpWindow.push.bind(tmpWindow));

		this.m_nMaxsize = tmpWindow.m_nMaxsize;
		this.m_pBuffer = tmpWindow.m_pBuffer;
		this.m_nNext = tmpWindow.m_nNext;
		this.m_bFilled = tmpWindow.m_bFilled;
	};
	/**
	 * Iterates over each of the items in this window from oldest to newest.
	 *
	 * @param {Function} func a function that will be called with each item.
	 */
	SlidingWindow.prototype.forEach = function (func) {
		if (typeof func != 'function') {
			throw new TypeError("Parameter must be a function, was " + (typeof func) + ".");
		}

		for (var i = 0, end = this.getSize(); i < end; ++i) {
			var bufferIndex = this.m_bFilled ? (this.m_nNext + i) % this.m_nMaxsize : i;
			func(this.m_pBuffer[bufferIndex]);
		}
	};
	/**
	 * @returns the number of items in this window.
	 */
	SlidingWindow.prototype.getSize = function () {
		return this.m_bFilled ? this.m_nMaxsize : this.m_nNext;
	};
	/**
	 * @return {String} Returns a string representation of this SlidingWindow.  This is intended to be human readable for debugging and may change.
	 */
	SlidingWindow.prototype.toString = function () {
		var result = [ "{sidingwindow start=" ];
		result.push(this.m_nNext);
		result.push(" values=[");
		result.push(this.m_pBuffer.join(","));
		result.push("] }");

		return result.join("");
	};
	SlidingWindow.prototype._checkSize = function (nSize) {
		if ((nSize > 0) == false) {
			throw new Error("Sliding window cannot be created with a size of " + nSize + ".");
		}
		if (nSize !== (nSize|0)) {
			throw new TypeError("Sliding window cannot be created with a non integer size (" + nSize + ").");
		}
	};
	SlidingWindow.prototype._changeWindow = function (oIncoming) {
		this.m_pBuffer[this.m_nNext] = oIncoming;
		this.m_nNext = (this.m_nNext + 1) % this.m_nMaxsize;
		if (this.m_nNext == 0) {
			this.m_bFilled = true;
		}
	};


	return {
		format: format,
		padBefore: padBefore,
		padAfter: padAfter,
		interpolate: interpolate,
		SlidingWindow: SlidingWindow,
		templateFormatter: templateFormatter
	};
});