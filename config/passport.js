const LocalStrategy = require('passport-local').Strategy,
			bcrypt = require('bcryptjs'),
			mongoose = require('mongoose');

const User = mongoose.model('users');

module.exports = function(passport) {
	passport.use(new LocalStrategy({usernameField: 'username', passReqToCallback: true}, (req, username, password, done) => {
		User.findOne({username: username})
			.then(user => {
				if (!user) 
					return done(null, false, req.flash('error_msg', 'No user found'));
			
				// match password (user password already encrypted from 'users.js' when registered)
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if(err) throw err;
					
					if (isMatch) 
						return done(null, user);
					else
						return done(null, false, req.flash('error_msg', 'Incorrect password'));
					
				});
			});
	}));
	
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
}