/*
 * Bundle: Helpers - auth.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const bcrypt = require("bcrypt");

class AuthHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} password
	 * @return {Promise}
	 */
	hash_password(password) {
		return new Promise((resolve, reject) => {
			bcrypt.genSalt(10, (error, salt) => {
				if (error) {
					return reject(error);
				}
				bcrypt.hash(password, salt, (error, hash) => {
					if (error) {
						return reject(error);
					}
					return resolve(hash);
				});
			});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} password
	 * @param  {String} hash
	 * @return {Promise}
	 */
	compare_password(password, hash) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, hash, (error, response) => {
				if (error) {
					return reject(error);
				}
				return resolve(response);
			});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function}
	 * @return {Promise}
	 */
	authorize(req, res, next) {
		let my_token = req.headers.authorization;

		this._app.helper.token.verify(my_token, req, res, next);
	}
}

module.exports = AuthHelper;
