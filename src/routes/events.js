/*
 * Bundle: Routes - events.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

class EventsRoute {
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
			this._app.handler.events.load.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/:event_id",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_info.bind(this._app.handler.events)
		);

		this._app.router.post(
			"/event",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.create.bind(this._app.handler.events)
		);

		this._app.router.put(
			"/event/:event_id",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.modify.bind(this._app.handler.events)
		);

		this._app.router.delete(
			"/event/:event_id",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.delete.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/:event_id/join",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_join.bind(this._app.handler.events)
		);

		this._app.router.post(
			"/event/:event_id/join",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.join.bind(this._app.handler.events)
		);

		this._app.router.delete(
			"/event/:event_id/join",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.unjoin.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/:event_id/like",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_like.bind(this._app.handler.events)
		);

		this._app.router.post(
			"/event/:event_id/like",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.like.bind(this._app.handler.events)
		);

		this._app.router.delete(
			"/event/:event_id/like",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.unlike.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/:event_id/picture",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_pictures.bind(this._app.handler.events)
		);

		this._app.router.post(
			"/event/:event_id/picture",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.add_pictures.bind(this._app.handler.events)
		);

		this._app.router.post(
			"/event/:event_id/report",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.report.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/distance/:distance/:page",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_by_distance.bind(this._app.handler.events)
		);

		this._app.router.get(
			"/event/distance/hashtag/:distance/:page/:hashtag",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_by_distance_with_hashtag
				.bind(this._app.handler.events)
			);

		this._app.router.get(
			"/event/distance/user/:distance/:page/:user",
			this._app.helper.auth.authorize.bind(this._app.helper.auth),
			this._app.handler.events.get_by_distance_with_user
				.bind(this._app.handler.events));
	}
}

module.exports = EventsRoute;
