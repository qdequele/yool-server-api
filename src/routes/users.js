/*
 * Bundle: Routes - users.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const multer	= require("multer");

class UsersRoute {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
		this.upload_mid = multer({
			dest: "uploads/"
		}).single("avatar");
	}

	/**
	 * Initialisation
	 */
	init() {
		this._app.router.param("user_id",
			this._app.handler.users.load
				.bind(this._app.handler.users));

		this._app.router.get("/user/:user_id",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.get_user_info
				.bind(this._app.handler.users));
		this._app.router.put("/user",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.modify_profile
				.bind(this._app.handler.users));
		this._app.router.delete("/user",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.delete_profile
				.bind(this._app.handler.users));

		this._app.router.put("/user/location",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.update_location
				.bind(this._app.handler.users));

		this._app.router.post("/user/hashtag",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.add_hashtags
				.bind(this._app.handler.users));
		this._app.router.delete("/user/hashtag",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.remove_hashtags
				.bind(this._app.handler.users));

		this._app.router.post("/user/notificationToken",
			this._app.helper.auth.authorize
				.bind(this._app.helper.auth),
			this._app.handler.users.add_notification_token
				.bind(this._app.handler.users));
		this._app.router.post("/user/upload/image",
			[this._app.helper.auth.authorize
				.bind(this._app.helper.auth), this.upload_mid],
			this._app.handler.users.upload_image
				.bind(this._app.handler.users));
	}
}

module.exports = UsersRoute;
