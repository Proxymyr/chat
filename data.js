var	mongoose = require('./getMongoose.js').mongoose;
var DataSchema = mongoose.Schema({
			'name': String,
			'value':String
		}),
DataModel = mongoose.model('Data', DataSchema);

exports.Data = DataModel;