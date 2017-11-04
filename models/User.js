const mongoose = require('mongoose'),
			Schema = mongoose.Schema;

const UserSchema = new Schema ({
	username: {
		type: String,
		required: true
	}, 
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

mongoose.model('users', UserSchema);