/*
 * Bundle: Handlers - auth.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const r					= require("rethinkdb");
const Validator	= require("jsonschema").Validator;

class AuthHandler {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} req
	 * @param  {Object} res
	 * @return {Response Express}
	 */
	login(req, res) {
		let validate = (user) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						email : {
							type : "email"
						},
						password : {
							type : "string"
						}
					},
					required : ["email", "password"]
				};

				if (v.validate(user, schema)) {
					resolve(user);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let find_user = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb.findBy("users", "email", user.email)
					.then((user_find) => {
						if (user_find[0] !== null) {
							resolve(user_find[0]);
						} else {
							reject("email_not_found");
						}
					});
			});
		};

		let compare_password = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.auth.compare_password(req.body.password, user.password)
					.then((data) => {
						if (data) {
							resolve(user.id);
						} else {
							reject("wrong_password")
						}
					})
					.catch((err) => {
						reject("wrong_password");
					});
			});
		};

		let generate_token = (user_id) => {
			return new Promise((resolve, reject) => {
				let response = {
					user_id : user_id,
					token : this._app.helper.token.generate(user_id)
				};

				if (response.token !== null) {
					resolve(response);
				} else {
					reject("cannot_generate_token");
				}
			});
		};

		validate(req.body)
			.then(find_user)
			.then(compare_password)
			.then(generate_token)
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
	signup(req, res) {
		let validate = (user) => {
			return new Promise((resolve, reject) => {
				let v = new Validator();
				const schema = {
					type : "object",
					properties : {
						email : {
							type : "email"
						},
						username : {
							type : "string"
						},
						password : {
							type : "string"
						},
						birthdate : {
							type : "int"
						}
					},
					required : ["email", "username", "password", "birthdate"]
				};

				if (v.validate(user, schema)) {
					resolve(user);
				} else {
					reject("the_information_arent_valid");
				}
			});
		};

		let check_existing = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb.findBy("users", "email", user.email)
					.then((user_find) => {
						if (user_find[0] && user_find[0] !== null) {
							reject("user_already_exist");
						} else {
							resolve(user);
						}
					});
			});
		};

		let hash = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.auth.hash_password(user.password)
					.then((hash) => {
						user.password = hash;
						resolve(user);
					})
					.catch((err) => {
						reject("impossible_hash_password");
					});
			});
		};

		let add_infos = (user) => {
			let json_user = {
				email : user.email,
				username : user.username,
				password : user.password,
				birthdate : user.birthdate,
				avatar : "",
				activated : true,
				hashtags : [],
				last_location : {},
				created_at : Date.now(),
				updated_at : Date.now(),
				notification_token : {
					ios : [],
					android : []
				}
			};

			return Promise.resolve(json_user);
		};

		let save = (user) => {
			return new Promise((resolve, reject) => {
				this._app.helper.rethinkdb.save("users", user)
					.then((result) => {
						if (result.inserted == 1) {
							resolve(result.generated_keys[0]);
						} else {
							reject("user_cannot_be_saved");
						}
					});
			});
		};

		let generate_token = (user_id) => {
			return new Promise((resolve, reject) => {
				let response = {
					user_id : user_id,
					token : this._app.helper.token.generate(user_id)
				};

				if (response.token !== null) {
					resolve(response);
				} else {
					reject("cannot_generate_token");
				}
			});
		};

		validate(req.body)
			.then(check_existing)
			.then(hash)
			.then(add_infos)
			.then(save)
			.then(generate_token)
			.then((user) => {
				res.status(201).send({
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
}

module.exports = AuthHandler;
