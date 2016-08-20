/*
 * Bundle: Routes - auth.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

class AuthRoute {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * Initialisation
	 */
	init() {
		this._app.router.post(
			"/auth/login",
			this._app.handler.auth.login.bind(this._app.handler.auth)
		);

		this._app.router.post(
			"/auth/signup",
			this._app.handler.auth.signup.bind(this._app.handler.auth)
		);
	}
}

module.exports = AuthRoute;
