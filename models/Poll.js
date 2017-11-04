const mongoose = require('mongoose'),
			Schema = mongoose.Schema;

const PollSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	options: [{
		name: {type: String, required: true},
		votes: {type: Number, default: 0},
	  _id: false
	}],
	colors: {
		type: Array,
		required: true
	},
	time: {
		type: Date,
		default: Date.now
	},
	user: {
		type: String,
		required: true
	}
});

mongoose.model('polls', PollSchema);