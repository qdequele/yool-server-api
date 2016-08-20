/*
 * Bundle: Models - events.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const r = require("rethinkdb");
const config = require("config");

class EventsModel {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
		r.connect(config.get("databases").rethinkdb)
			.then((connection) => {
				this.connection = connection;
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Integer} dist distance
	 * @param  {Float} lat latitude
	 * @param  {Float} long longitude
	 * @param  {Integer} p page
	 * @return {Promise}
	 */
	geo_all(dist, lat, long, p) {
		let circle = r.circle([lat, long],
			parseInt(dist), {
				unit : "km"
			});

		return new Promise((resolve, reject) => {
			r.table("events")
				.getIntersecting(circle, {
					index : "location"
				})
				.filter({
					is_private : false
				})
				.orderBy(r.desc("created_at"))
				.slice(p * 20, (p + 1) * 20)
				.run(this.connection)
				.then((result) => {
					console.log(result);
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Integer} dist distance
	 * @param  {Float} lat latitude
	 * @param  {Float} long longitude
	 * @param  {Integer} p page
	 * @param {String} k key
	 * @param {String} v value
	 * @return {Promise}
	 */
	geo_contain(dist, lat, long, p, k, v) {
		let circle = r.circle([lat, long],
			parseInt(dist), {
				unit : "km"
			});

		return new Promise((resolve, reject) => {
			r.table("events")
				.getIntersecting(circle, {
					index: "location"
				})
				.filter({
					is_private : false
				})
				.orderBy(r.desc("created_at"))
				.filter((item) => {
					return item(k).contains(v);
				})
				.slice(p * 20, (p + 1) * 20)
				.run(this.connection)
				.then((result) => {
					console.log(result);
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Integer} p page
	 * @param {String} k key
	 * @param {String} v value
	 * @return {Promise}
	 */
	contain(p, k, v) {
		return new Promise((resolve, reject) => {
			r.table("events")
				.filter({
					is_private : false
				})
				.filter((item) => {
					return item(k).contains(v);
				})
				.orderBy(r.desc("created_at"))
				.slice(p * 20, (p + 1) * 20)
				.run(this.connection)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
}

module.exports = EventsModel;
