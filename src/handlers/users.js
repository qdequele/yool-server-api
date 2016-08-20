/*
 * Bundle: Handlers - users.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const r					= require("rethinkdb");
const Validator	= require("jsonschema").Validator;

class UsersHandler {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * Populate req.user by the object find in the bdd for this id
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @param  {Function} next
	 * @param  {String} id
	 * @return {Response Express}
	 */
	load(req, res, next, id) {
		this._app.helper.rethinkdb
			.findBy("users", "id", id)
			.then((user) => {
				req.user = user[0];
				next();
			})
			.catch((err) => {
				res.status(404).send({
					ok : false,
					error : "user_not_found"
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
	get_user_info(req, res) {
		let format_user = (user) => {
			delete user.password;
			delete user.notification_token;
			delete user.last_location;
			return Promise.resolve(user);
		};

		format_user(req.user)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	modify_profile(req, res) {

		let validate = (user) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						username : {
							type : "string"
						},
						birthdate : {
							type : "date"
						}
					}
				};

				if (v.validate(user, schema)) {
					resolve(user);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let update = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.edit("users", req.user_id, user)
					.then((user) => {
						resolve("user_updated");
					})
					.catch((err) => {
						reject("user_cannot_be_updated");
					});
			});
		};

		validate(req.body)
			.then(update)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	delete_profile(req, res) {

		let validate = (user) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						password : {
							type : "string"
						}
					},
					required: ["password"]
				};

				if (v.validate(user, schema)) {
					resolve();
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let get_user_info = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						resolve(user[0]);
					})
					.catch((err) => {
						reject("user_not_found");
					});
			});
		};

		let compare_password = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.auth
					.compare_password(req.body.password, user.password)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject("wrong_password");
					});
			});
		};

		let delete_user = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.destroy("users", req.user_id)
					.then(() => {
						resolve("user_deleted");
					})
					.catch((err) => {
						reject("user_cannot_be_deleted");
					});
			});
		};

		validate(req.body)
			.then(get_user_info)
			.then(compare_password)
			.then(delete_user)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	update_location(req, res) {

		let validate = (user_location) => {
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
						}
					},
					required : ["loc"]
				};

				if (v.validate(user_location, schema)) {
					resolve(user_location);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let create_model = (user_location) => {
			let json_event = {
				last_location : r.point(parseFloat(user_location.loc.latitude),
					parseFloat(user_location.loc.longitude))
			};

			return Promise.resolve(json_event);
		};

		let update = (user_location) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.edit("users", req.user_id, user_location)
					.then((user) => {
						resolve("user_location_updated");
					})
					.catch((err) => {
						reject("user_location_cannot_be_updated");
					});
			});
		};

		validate(req.body)
			.then(create_model)
			.then(update)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	add_hashtags(req, res) {
		let validate = (hashtag) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						hastag : {
							type : "string"
						}
					}
				};

				if (v.validate(hashtag, schema)) {
					resolve();
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let find_hashtag = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						if (user[0].hashtags.indexOf(req.body.hashtag) != -1) {
							reject("hashtag_already_add");
						} else {
							resolve();
						}
					})
					.catch((err) => {
						reject("user_not_found");
					});
			});
		};

		let update_hashtags = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.append("users", req.user_id, "hashtags", req.body.hashtag)
					.then(() => {
						resolve("user_updated");
					})
					.catch((err) => {
						reject("hashtags_cannot_be_updated");
					});
			});
		};

		validate(req.body)
			.then(find_hashtag)
			.then(update_hashtags)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	remove_hashtags(req, res) {
		let validate = (hashtag) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						hastag : {
							type : "string"
						}
					}
				};

				if (v.validate(hashtag, schema)) {
					resolve();
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let find_hashtag = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						if (user[0].hashtags.indexOf(req.body.hashtag) != -1) {
							resolve(user[0].hashtags.indexOf(req.body.hashtag));
						} else {
							reject("hashtag_not_found");
						}
					})
					.catch((err) => {
						reject("user_not_found");
					});
			});
		};

		let remove_hashtag = (id) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.delete_at_index("users", req.user_id, "hashtags", id)
					.then((user) => {
						resolve("hashtag_removed");
					})
					.catch((err) => {
						reject("hashtags_cannot_be_removed");
					});
			});
		};

		validate(req.body)
			.then(find_hashtag)
			.then(remove_hashtag)
			.then((user) => {
				res.status(200).send({
					ok : true,
					message : user
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
	add_notification_token(req, res) {

		let validate = (notification_token) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						ios : {
							type : "string"
						},
						android : {
							type : "string"
						}
					}
				};

				if (v.validate(notification_token, schema)) {
					resolve();
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let find_notification_token = () => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb
					.findBy("users", "id", req.user_id)
					.then((user) => {
						if ((req.body.ios &&
							user[0].notification_token.ios.indexOf(req.body.ios) != -1) ||
							(req.body.android &&
								user[0].notification_token.android.indexOf(req.body.android) != -1)) {
							reject("notification_token_already_add");
						} else {
							resolve();
						}
					})
					.catch((err) => {
						reject("user_not_found");
					});
			});
		};

		let add_notification_token = () => {
			return new Promise((resolve, reject) => {
				let key = (req.body.ios) ?
					"notification_token.ios" : "notification_token.android";
				let value = (req.body.ios) ? req.body.ios : req.body.android;

				this._app.helper.rethinkdb
					.append("users", req.user_id, key, value)
					.then((user) => {
						resolve("notification_token_added");
					})
					.catch((err) => {
						reject("notification_token_not_added");
					});
			});
		};

		validate(req.body)
			.then(find_notification_token)
			.thn(add_notification_token)
			.then((message) => {
				res.status(200).send({
					ok : true,
					message : message
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
	upload_image(req, res) {

		let check_file = () => {
			return new Promise((resolve, reject) => {
				if (!req.file) {
					reject("expected_one_avatar");
				}
				if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
					reject("expected_image_file");
				}
				resolve(req.file);
			});
		};

		let get_info_image = (filename) => {
			return new Promise((resolve, reject) => {
				this._app.helper.image
					.info(filename)
					.then((info) => {
						resolve(info);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		let resize_image = (file) => {
			return this._app.helper.image.resize(file);
		};

		let upload_file = (file) => {
			return this._app.helper.image.upload_to_s3(file.path, "users/", file.name);
		};

		let add_to_user = (file_url) => {
			return new Promise((resolve, reject) => {
				const update = {
					avatar: file_url
				};

				this._app.helper.rethinkdb
					.edit("users", req.user_id, update)
					.then(() => {
						resolve("user_updated");
					})
					.catch(() => {
						reject("user_not_updated");
					});
			});
		};

		check_file()
			.then(get_info_image)
			.then(resize_image)
			.then(upload_file)
			.then(add_to_user)
			.then((message) => {
				res.status(200).send({
					ok : true,
					message : message
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

module.exports = UsersHandler;
