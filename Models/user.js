var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	email: String,
	password: String,
	userType:String,
	mobile:String
}),
User = mongoose.model('User', userSchema);

module.exports = User;