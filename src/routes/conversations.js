/*
 * Bundle: Routes - conversations.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

class ConversationsRoute {
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
		this._app.router.param(
			"event_id",
			this._app.handler.conversations.load
				.bind(this._app.handler.conversations));

		this._app.router.get("/message/:conversation_id",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.conversations.get_all_messages
				.bind(this._app.handler.conversations));
	}
}

module.exports = ConversationsRoute;
