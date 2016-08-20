/*
 * Bundle: Helpers - email.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const ses = require("node-ses");

class EmailHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
		this.client = ses.createClient({
			key : process.env.AWS_ACCESS_KEY_ID,
			secret : process.env.AWS_SECRET_ACCESS_KEY
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} email
	 * @param  {String} subject
	 * @param  {HTML file} html
	 * @param  {String} plain_text
	 * @return {Promise}
	 */
	send_email(email, subject, html, plain_text) {
		return new Promise((resolve, reject) => {
			this.client.sendEmail({
				to : email,
				from : "info@getyoo.com",
				subject : subject,
				message : html,
				altText : plain_text
			}, function (err, data, res) {
				if (err) {
					return reject("email_cannot_be_send");
				}
				return resolve("email_send");
			});
		});
	}
}

module.exports = EmailHelper;
