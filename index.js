/*
 * Bundle: index.js
 * Project: Yool - Server - API
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

"use strict";

if (process.env.NODE_ENV && process.env.NODE_ENV == "production") {
	require("newrelic");
}

const config								= require("config");
const express								= require("express");
const bodyParser						= require("body-parser");
const morgan								= require("morgan");
const cors									= require("cors");

const AuthHelper						= require("./src/helpers/auth");
const EmailHelper						= require("./src/helpers/email");
const HashtagHelper					= require("./src/helpers/hashtag");
const ImageHelper						= require("./src/helpers/image");
const NotificationHelper		= require("./src/helpers/notification");
const RethinkdbHelper				= require("./src/helpers/rethinkdb");
const TokenHelper						= require("./src/helpers/token");

const AuthRoute							= require("./src/routes/auth");
const ConversationsRoute		= require("./src/routes/conversations");
const EventsRoute						= require("./src/routes/events");
const UsersRoute						= require("./src/routes/users");

const AuthHandler						= require("./src/handlers/auth");
const ConversationsHandler	= require("./src/handlers/conversations");
const EventsHandler					= require("./src/handlers/events");
const UsersHandler					= require("./src/handlers/users");

const EventsModel						= require("./src/models/events");

class App {
	/**
	 * Contructor
	 */
	constructor() {
		this.environment	= (process.env.NODE_ENV || "development");
		this.dirname			= __dirname;

		//helpers
		this.helper										= {};
		this.helper.token							= new TokenHelper(this);
		this.helper.auth							= new AuthHelper(this);
		this.helper.email							= new EmailHelper(this);
		this.helper.hashtag						= new HashtagHelper(this);
		this.helper.image							= new ImageHelper(this);
		this.helper.notification			= new NotificationHelper(this);
		this.helper.rethinkdb					= new RethinkdbHelper(this);

		//models
		this.model										= {};
		this.model.events							= new EventsModel(this);

		//Handlers
		this.handler									= {};
		this.handler.auth							= new AuthHandler(this);
		this.handler.conversations		= new ConversationsHandler(this);
		this.handler.events						= new EventsHandler(this);
		this.handler.users						= new UsersHandler(this);

		//Routes
		this.route										= {};
		this.route.auth								= new AuthRoute(this);
		this.route.conversations			= new ConversationsRoute(this);
		this.route.events							= new EventsRoute(this);
		this.route.users							= new UsersRoute(this);

		return this.startExpress();
	}

	/**
	 * @description [description]
	 * @private
	 * @return {null}
	 */
	_init_middleware() {
		this.router.use(bodyParser.urlencoded({
			extended: false
		}));
		this.router.use(bodyParser.json());
		this.router.use(morgan("dev"));
		this.router.use(cors());
	}

	/**
	 * @description [description]
	 * @public
	 * @return {null}
	 */
	startExpress() {
		return new Promise((resolve, reject) => {
			this.router = express();
			this._init_middleware();
			// Initialize routes
			this.route.auth.init();
			this.route.conversations.init();
			this.route.events.init();
			this.route.users.init();
			// Start express
			this.router.listen({
				port : config.get("express").port,
				host : config.get("express").host
			}, (error) => {
				if (error) {
					reject();
				} else {
					console.log("server start on : " +
						config.get("express").host +
						":" +
						config.get("express").port);
					resolve(this);
				}
			});
		});
	}
}

new App();
