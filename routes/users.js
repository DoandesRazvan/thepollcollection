const express = require('express'),
			mongoose = require('mongoose'),
			passport = require('passport'),
			bcrypt = require('bcryptjs'),
			{ensureAuthenticated} = require('../helpers/auth'),
			router = express.Router();

require('../models/User');
const User = mongoose.model('users');

require('../models/Poll');
const Poll = mongoose.model('polls');

router.get('/register', (req, res) => {
	res.render('register')
});

router.post('/register', (req, res) => {
	var errors = [];
	
	if (req.body.password != req.body.password2)
		errors.push('Passwords do not match');
	
	if (req.body.password.length < 4)
		errors.push('Password must be at least 4 characters');
	
	// if there are errors refresh the page with all the valid data the user typed still available
	if (errors.length > 0) {
		res.render('register', {
			errors: errors,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			password2: req.body.password2
		});
	} else {
		User.findOne({username: req.body.username})
			.then(user => {
				if(user) {
					req.flash('error_msg', 'Username already taken');
					res.redirect('/users/register');
				} else {
					User.findOne({email: req.body.email})
						.then(user => {
							if (user) {
								req.flash('error_msg', 'Email already taken'); // connect flash in the future
								res.redirect('/users/register');
							} else {
								var newUser = new User ({
									username: req.body.username,
									email: req.body.email,
									password: req.body.password
								});
								
								bcrypt.genSalt(10, (err, salt) => {
									bcrypt.hash(newUser.password, salt, (err, hash) => {
										if (err) throw err;
										
										newUser.password = hash;
										newUser.save()
											.then(user => {
												req.flash('success_msg', 'Registration successful! You can now login!');
												res.redirect('/users/login')
											})
											.catch(err => {
												console.log(err);
												return;
											});
									});
								});
							}
						});
				}	
			});
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/users/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
	Poll.find({user: req.user._id})
		.sort({time: -1})
		.then(polls => {
			res.render('dashboard', {polls: polls});
		})
})

router.get('/logout', ensureAuthenticated, (req, res) => {
	req.logout();
	req.flash("success_msg", "You've been successfully logged out!");
	res.redirect('/users/login');
});

module.exports = router;