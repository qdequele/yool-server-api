/*
 * Bundle: Helpers - hashtag.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

class HashtagHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} str
	 * @return {String}
	 */
	format(str) {
		let array = str.split("#");
		let ret_str = array[0];

		for (var i = 1; i < array.length; i++) {
			ret_str = ret_str.concat(" #");
			ret_str = ret_str.concat(array[i]);
		}

		return ret_str;
	}
}

module.exports = HashtagHelper;
