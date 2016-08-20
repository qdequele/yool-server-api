/*
 * Bundle: Helpers - rethinkdb.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const r = require("rethinkdb");
const config = require("config");

class RethinkdbHelper {
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
	 * @param  {String} table_name
	 * @param  {String} id
	 * @return {Promise}
	 */
	find(table_name, id) {
		return r.table(table_name)
			.get(id)
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @return {Promise}
	 */
	findAll(table_name) {
		return r.table(table_name)
			.run(this.connection)
			.then((cursor) => {
				return Promise.resolve(cursor.toArray());
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} field_name
	 * @param  {String} value
	 * @return {Promise}
	 */
	findBy(table_name, field_name, value) {
		return r.table(table_name)
			.filter(r.row(field_name).eq(value))
			.orderBy(r.asc("created_at"))
			.run(this.connection)
			.then((cursor) => {
				return Promise.resolve(cursor.toArray());
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} query
	 * @param  {String} index
	 * @return {Promise}
	 */
	findIndexed(table_name, query, index) {
		return r.table(table_name)
			.getAll(query, {
				index: index
			})
			.run(this.connection)
			.then((cursor) => {
				return Promise.resolve(cursor.toArray());
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} field
	 * @param  {String} attribute
	 * @return {Promise}
	 */
	findAllContain(table_name, field, attribute) {
		return r.table(table_name)
			.filter((item) => {
				return item[field].contains(attribute);
			})
			.run(this.connection)
			.then((cursor) => {
				return Promise.resolve(cursor.toArray());
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} table_name_2
	 * @param  {String} key
	 * @return {Promise}
	 */
	populate(table_name, table_name_2, key) {
		return r.table(table_name)
			.eqJoin(key, r.table(table_name_2))
			.map((row) => {
				return row("left").merge({
					[key]: row("right")
				});
			})
			.run(this.connection)
			.then((cursor) => {
				return Promise.resolve(cursor.toArray());
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {Object} object
	 * @return {Promise}
	 */
	save(table_name, object) {
		return r.table(table_name)
			.insert(object)
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} id
	 * @param  {Object} object
	 * @return {Promise}
	 */
	edit(table_name, id, object) {
		return r.table(table_name)
			.get(id).update(object)
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} id
	 * @return {Promise}
	 */
	is_updated(table_name, id) {
		return r.table(table_name)
			.get(id)
			.update({
				updated_at: Date.now()
			})
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} id
	 * @param  {String} key
	 * @param  {String} value
	 * @return {Promise}
	 */
	append(table_name, id, key, value) {
		return r.table(table_name)
			.get(id)
			.update({
				[key]: r.row(key).append(value)
			})
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} id
	 * @param  {String} key
	 * @param  {String} index
	 * @return {Promise}
	 */
	delete_at_index(table_name, id, key, index) {
		return r.table(table_name)
			.get(id)
			.update({
				[key]: r.row(key).deleteAt(index)
			})
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} table_name
	 * @param  {String} id
	 * @return {Promise}
	 */
	destroy(table_name, id) {
		return r.table(table_name)
			.get(id)
			.delete()
			.run(this.connection)
			.then((result) => {
				return Promise.resolve(result);
			});
	}
}

module.exports = RethinkdbHelper;
