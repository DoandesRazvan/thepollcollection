const express = require('express'),
			mongoose = require('mongoose'),
			methodOverride = require('method-override'),
			colorGenerator = require('color-generator'),
			{ensureAuthenticated} = require('../helpers/auth'),
			router = express.Router();

// method override middleware (used for PUT request)
router.use(methodOverride('_method'));

require('../models/Poll');
const Poll = mongoose.model('polls');

router.get('/all', (req, res) => {
	Poll.find({})
		.sort({time: -1})
		.then(polls => {
			res.render('allpolls', {polls: polls})
		})
})

router.get('/newpoll', ensureAuthenticated, (req, res) => {
	res.render('newpoll');
});

router.post('/newpoll', ensureAuthenticated, (req, res) => {
	var pollTitle = req.body.title,
			pollOptions = req.body.options.split(';').map(option => option.trim()).filter(val => val.length > 0),
			pollOptionsLength = pollOptions.length,
			pollOptionsArr = [],
			chartColorsArr = [];
	
	// filtering options duplicates
	pollOptions = pollOptions.filter((option, pos) => {
		return pollOptions.indexOf(option) == pos;
	})
	
	while(pollOptionsLength) {
		chartColorsArr.push(colorGenerator().hexString());
		
		pollOptionsLength--;
	}
	
	// creating the options array for the database
	for (let i = 0; i < pollOptions.length; i++) {
		var optionName = pollOptions[i];
		
		pollOptionsArr[i] = {
			name: optionName
		};
	}
	
	if (pollOptionsArr.length <= 1) {
		res.render('newpoll', {
			errors: ["Please add at least 2 options"],
			title: req.body.title,
			options: req.body.options
		});
	} else {
		var newPoll = new Poll ({
										title: pollTitle,
										options: pollOptionsArr,
										colors: chartColorsArr,
										user: req.user._id
									});

		newPoll.save()
			.then(poll => {
				res.redirect(`/polls/${poll._id}`);
			});
	}
});

router.get('/:id', (req, res) => {
	var pollId = req.params.id;
			
	Poll.findOne({_id: pollId})
		.then(poll => {
			res.render('poll', {title: poll.title, options: poll.options, colors: poll.colors, pollId: pollId});
		});
});

router.put('/:id', ensureAuthenticated, (req, res) => {
	var pollId = req.params.id,
			option = req.body.option;
	
	if (option.length == 0){
		req.flash('error_msg', 'Please choose an option');
		res.redirect(`/polls/${pollId}`);
	} else {
		// updating database when a user votes
		Poll.findOne({_id: pollId})
			.then(poll => {
				for (let j = 0; j < poll.options.length; j++) {
					if (poll.options[j].name == option) {
						poll.options[j].votes++;

						break;
					}

					// if the user created a new option then add it to the poll
					if (j == poll.options.length - 1) {
						poll.options.push({"name": option});
						poll.colors.push(colorGenerator().hexString());
					}
				}

				poll.save()
					.then(updatedPoll => {
						res.redirect(`/polls/${pollId}`);
					});
			});
	}
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
	Poll.remove({_id: req.params.id})
		.then(() => {
			req.flash('success_msg', 'Poll successsfully removed');
			res.redirect('/users/dashboard');
		})
});

module.exports = router;