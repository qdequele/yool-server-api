/*
 * Bundle: Handlers - events.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const r							= require("rethinkdb");
const Validator			= require("jsonschema").Validator;
const findHashtags	= require("find-hashtags");

class EventsHandler {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * Populate req.event by the object find in the bdd for this id
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 * @param  {String} id
	 * @return {Response Express}
	 */
	load(req, res, next, id) {
		this._app.helper.rethinkdb
			.findBy("events", "id", id)
			.then((event) => {
				req.event = event[0];
				this._app.helper.rethinkdb.is_updated("events", id);
				next();
			})
			.catch((err) => {
				return res.status(404).send({
					ok : false,
					error : "event_not_found"
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_info(req, res) {
		res.status(200).send({
			ok : true,
			message : req.event
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	create(req, res) {
		let validate = (user) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						loc : {
							type : "object",
							properties : {
								latitude : {
									type : "number"
								},
								longitude : {
									type : "number"
								}
							},
							required : ["longitude", "latitude"]
						},
						content : {
							type : "object",
							properties : {
								message : {
									type : "string"
								}
							}
						},
						is_private : {
							type : "boolean"
						}
					},
					required : ["content"]
				};

				if (v.validate(user, schema)) {
					resolve(user);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let create_model = (event) => {

			let json_event = {
				created_by: req.user_id,
				location : r.point(parseFloat(event.loc.latitude),
					parseFloat(event.loc.longitude)),
				content : event.content,
				hashtags : findHashtags(
					this._app.helper.hashtag.format(event.content.message)),
				pictures : [],
				joined : [req.user_id],
				liked : [],
				conversation_id : "",
				is_private : (event.is_private !== undefined) ?
					event.is_private : false,
				created_at : Date.now(),
				updated_at : Date.now(),
				reported : []
			};

			return Promise.resolve(json_event);
		};

		let create_conversation = (event) => {
			return new Promise((resolve, reject) => {
				let conversation = {
					is_private : event.is_private,
					created_by : req.user_id,
					users : [req.user_id]
				};

				this._app.helper.rethinkdb.save("conversations", conversation)
					.then((result) => {
						if (result.inserted == 1 && result.generated_keys[0]) {
							event.conversation_id = result.generated_keys[0];
							resolve(event);
						} else {
							reject("conversation_cannot_be_created");
						}
					});
			});
		};

		let save_event = (event) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb.save("events", event)
					.then((result) => {
						if (result.inserted == 1) {
							resolve(result.generated_keys[0]);
						} else {
							reject("event_cannot_be_created");
						}
					});
			});
		};

		validate(req.body)
			.then(create_model)
			.then(create_conversation)
			.then(save_event)
			.then((event) => {
				res.status(201).send({
					ok : true,
					message : event
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	modify(req, res) {
		let validate = (event) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						content : {
							type : "object",
							properties : {
								message : {
									type : "string"
								}
							}
						},
						is_private : {
							type : "boolean"
						}
					}
				};

				if (v.validate(event, schema)) {
					resolve(event);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let check_authorisation = (event) => {
			return new Promise((resolve, reject) => {
				if (req.event.created_by == req.user_id) {
					resolve(event);
				} else {
					reject("permission_denied");
				}
			});
		};

		let create_model = (event) => {
			let json_event = {
				content : (req.body.content !== undefined) ?
					req.body.content : event.content,
				hashtags : (req.body.content !== undefined) ?
					findHashtags(
						this._app.helper.hashtag.format(req.body.content.message))
					: event.hashtags,
				is_private : (event.is_private !== undefined) ? event.is_private : false
			};

			return Promise.resolve(json_event);
		};

		let update = (event) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.edit("events", req.event.id, event)
					.then((event) => {
						resolve("event_updated");
					})
					.catch((err) => {
						reject("event_cannot_be_updated");
					});
			});
		};

		validate(req.body)
			.then(check_authorisation)
			.then(create_model)
			.then(update)
			.then((event) => {
				res.status(201).send({
					ok : true,
					message : event
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	delete(req, res) {
		let check_authorisation = () => {
			return new Promise((resolve, reject) => {
				if (req.event.created_by == req.user_id) {
					resolve();
				} else {
					reject("permission_denied");
				}
			});
		};

		let delete_event = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.destroy("events", req.event.id)
					.then(() => {
						resolve("event_deleted");
					})
					.catch((err) => {
						reject("event_cannot_be_removed");
					});
			});
		};

		check_authorisation()
			.then(delete_event)
			.then((event) => {
				res.status(201).send({
					ok : true,
					message : event
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_join(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	join(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	unjoin(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_like(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	like(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	unlike(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_pictures(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	add_pictures(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	report(req, res) {

	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_by_distance(req, res) {

		let get_user_location = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						console.log(user[0]);
						resolve(user[0]);
					})
					.catch(() => {
						reject("user_not_found");
					});
			});
		};

		let get_events = (user) => {
			return this._app.mnodels.events.geo_all(
				req.params.distance,
				user.last_location.coordinates[0],
				user.last_location.coordinates[1],
				req.params.page);
		};

		get_user_location()
			.then(get_events)
			.then((events) => {
				res.status(201).send({
					ok : true,
					message : events
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_by_distance_with_hashtag(req, res) {

		let get_user_location = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						resolve(user[0]);
					})
					.catch(() => {
						reject("user_not_found");
					});
			});
		};

		let get_events = (user) => {
			return this._app.mnodels.events.geo_contain(
				req.params.distance,
				user.last_location.coordinates[0],
				user.last_location.coordinates[1],
				req.params.page,
				"hashtags",
				req.params.hashtag
			);
		};

		get_user_location()
			.then(get_events)
			.then((events) => {
				res.status(201).send({
					ok : true,
					message : events
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	get_by_distance_with_user(req, res) {

		let get_user_location = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						resolve(user[0]);
					})
					.catch(() => {
						reject("user_not_found");
					});
			});
		};

		let get_events = (user) => {
			return this._app.mnodels.events.geo_contain(
				req.params.distance,
				user.last_location.coordinates[0],
				user.last_location.coordinates[1],
				req.params.page,
				"joined",
				req.params.user
			);
		};

		get_user_location()
			.then(get_events)
			.then((events) => {
				res.status(201).send({
					ok : true,
					message : events
				});
			})
			.catch((err) => {
				res.status(400).send({
					ok : false,
					error : err
				});
			});
	}
}

module.exports = EventsHandler;
