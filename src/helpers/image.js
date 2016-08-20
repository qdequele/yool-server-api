/*
 * Bundle: Helpers - image.js
 * Project: Yool - Server
 * Author: Quentin de Quelen <quentin@dequelen.me>
 */

const AWS = require("aws-sdk");
const config = require("config");
const fs = require("fs");
const easyimg = require("easyimage");

class ImageHelper {
	/**
	 * Constructor
	 */
	constructor(app) {
		this._app = app;
		AWS.config = {
			accessKeyId : process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
			region : "eu-west-1"
		};
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {String} file_path
	 * @param  {String} dest_folder_name
	 * @param  {String} dest_file_name
	 * @return {Promise}
	 */
	upload_to_s3(file_path, dest_folder_name, dest_file_name) {
		let photoBucket = new AWS.S3({
			params : {
				ACL: "public-read",
				Bucket : "storage.getyool.com",
				Key : dest_folder_name + dest_file_name
			}
		});

		return new Promise((resolve, reject) => {
			photoBucket.createBucket(() => {
				photoBucket
				.upload({
					Body: fs.createReadStream(file_path)
				}, (err, data) => {
					fs.unlink(file_path);
					if (err) {
						return reject("impossible_to_upload_image");
					}
					return resolve(data.Location);
				});
			});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} src_path
	 * @return {Promise}
	 */
	info(src_path) {
		return new Promise((resolve, reject) => {
			easyimg.info(src_path.path)
			.then((info) => {
				return resolve(info);
			}, (err) => {
				return reject("no_image_info");
			});
		});
	}

	/**
	 * @description [description]
	 * @public
	 * @param  {Object} file
	 * @return {Promise}
	 */
	resize(file) {
		return new Promise((resolve, reject) => {
			easyimg.thumbnail({
				src: file.path,
				dst: file.path,
				width: file.width,
				height: file.height,
				cropwidth: file.width,
				cropheight: file.height,
				x: 0,
				y: 0
			}).then((image) => {
				return resolve(image);
			}, (err) => {
				return reject("impossible_to_resize_image");
			});
		});
	}
}

module.exports = ImageHelper;
