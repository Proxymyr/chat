var mongoose = require('mongoose');
mongoose.connect('127.0.0.1', 'nicochat');

var UserSchema = mongoose.Schema({
	'username' : { type: String, unique: true },
	'avatar': String,
	'level': String,
	'password': String
});

DataModel = mongoose.model('User', UserSchema);

exports.User = DataModel;
