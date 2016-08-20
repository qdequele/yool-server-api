/*
 * Bundle: Handlers - conversations.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

class ConversationsHandler {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * Populate req.conversation by the object find in the bdd for this id
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 * @param  {String} id
	 * @return {Response Express}
	 */
	load(req, res, next, id) {
		this._app.helper.rethinkdb
			.findBy("conversations", "id", id)
			.then((conversation) => {
				req.conversation = conversation;
				next();
			})
			.catch((err) => {
				return res.status(404).send({
					ok : false,
					error : "conversation_not_found"
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
	get_all_messages(req, res) {
		let find_all_messages = (conversation_id) => {
			return this._app.helper.rethinkdb
				.findBy("messages", "conversation_id", conversation_id);
		};

		find_all_messages(req.conversation.id)
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
}

module.exports = ConversationsHandler;


