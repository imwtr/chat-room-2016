var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = require('schema');

// schema发布为model
for (var item in schema) {
	mongoose.model(item, new Schema(schema[item]));
}

/**
 * 根据schema发布model名返回
 */
module.exports = {
	/**
	 * @param  {[model name]}
	 * @return {[model object]}
	 */
	getModel: function(type) {
		return mongoose.model(type);
	}
};