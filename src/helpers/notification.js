/*
 * Bundle: Helpers - notification.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const apn			= require("apn");
const gcm			= require("node-gcm-service");
const config	= require("config");

class NotificationHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * @description [description]
	 * @private
	 * @param  {String} device_id
	 * @param  {Object} message
	 * @return {Promise}
	 */
	_push_to_ios(device_id, message) {
		let apn_connection = new apn.Connection({
			production : (process.env.NODE_ENV == "production") ? true : false
		});
		let apn_device = new apn.Device(device_id);
		let apn_notification = new apn.Notification();

		apn_notification.alert = message.content;
		apn_notification.badge = 0;
		apn_notification.contentAvailable = true;

		apn_connection.pushNotification(apn_notification, apn_device);
	}

	/**
	 * @description [description]
	 * @private
	 * @param  {String} device_id
	 * @param  {Object} message
	 * @return {Promise}
	 */
	_push_to_android(device_id, message) {
		let data = new gcm.Message({
			data : {
				title: message.title,
				message: message.content
			},
			delay_while_idle : false,
			dry_run : false
		});
		let sender = new gcm.Sender();

		sender.setAPIKey(process.env.GCM_KEY);
		sender.sendMessage(data.toString(), device_id, true, () => {});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} user_id
	 * @param  {Object} message
	 * @return {Promise}
	 */
	send_notification_to_user(user_id, message) {
		return new Promise((resolve, reject) => {
			this._app.helper.rethinkdb.findBy("users", "id", user_id)
				.then((user) => {
					user[0].notification_token.ios.forEach((element) => {
						this._push_to_ios(element, message);
					});
					user[0].notification_token.android.forEach((element) => {
						this._push_to_android(element, message);
					});
					return resolve("notification_sent");
				})
				.catch(() => {
					return reject("user_not_found");
				});
		});
	}
}

module.exports = NotificationHelper;
