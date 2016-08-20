/*
 * Bundle: Helpers - token.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const jwt			= require("jwt-simple");
const moment	= require("moment");

class TokenHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
		this.secret = process.env.TOKEN_SECRET;
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} user_id
	 * @return {Promise}
	 */
	generate(user_id) {
		let expires = moment().add(7, "days").valueOf();
		let token = jwt.encode({
			user : user_id,
			exp : expires
		}, this.secret);

		return token;
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} token
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 * @return {Promise}
	 */
	verify(token, req, res, next) {
		if (!token) {
			console.log("404 verify");
			res.status(404).send({
				ok : false,
				error : "token_not_found"
			});
		}

		let decoded = jwt.decode(token, this.secret);

		if (decoded.exp <= moment().format("x")) {
			console.log("401 verify");
			res.status(401).send({
				ok : false,
				error : "token_has_expired"
			});
		} else {
			req.user_id = decoded.user;
			this._app.helper.rethinkdb.is_updated("users", req.user_id);
			next();
		}
	}
}

module.exports = TokenHelper;
