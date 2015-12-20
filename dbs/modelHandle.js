var getModel = require('getModel');

module.exports = modelHandle;


/**
 * 模型操作器  提供数据库模型操作常用的功能
 * @type {Object}
 */
var modelHandle = {
	/**
	 * @param  type String {模型名}
	 * @param  obj Object {[要创建的对象]}
	 * @param  cb Function {创建后的回调函数}
	 * @return {[type]}
	 */
	create: function(type, obj, cb) {
		getModel(type).create(obj, cb);
	},
	/**
	 * @param  type String {模型名}
	 * @param  condition Object {[查找条件]}
	 * @param  cb Function {回调函数}
	 * @return {[type]}
	 */
	find: function(type, condition, cb) {
		getModel(type).find(condition, cb);
	},
	/**
	 * @param  type String {模型名}
	 * @param  condition Object {[查找条件]}
	 * @param  cb Function {回调函数}
	 * @return {[type]}
	 */
	findOne: function(type, condition, cb) {
		getModel(type).findOne(condition, cb);
	},
	/**
	 * @param  type String {模型名}
	 * @param  condition Object {[查找条件]}
	 * @param  obj Object [更新成对象]
	 * @param  cb Function {回调函数}
	 * @return {[type]}
	 */
	update: function(type, condition, obj, cb) {
		getModel(type).update(condition, obj, cb);
	}
}