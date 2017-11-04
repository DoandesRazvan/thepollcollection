const express = require('express'),
			mongoose = require('mongoose'),
			bodyParser = require('body-parser'),
			cookieParser = require('cookie-parser'),
			expressValidator = require('express-validator'),
			flash = require('connect-flash'),
			session = require('express-session'),
			passport = require('passport'),
			path = require('path'),
			app = express();

const port = process.env.PORT || 3000;

// loading routes
const users = require('./routes/users');
const polls = require('./routes/polls')

require('./models/Poll');
const Poll = mongoose.model('polls');

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// connect flash middleware
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.user = req.user || null;
	
	next();
});

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://fuzyon:1234@ds145275.mlab.com:45275/thepollcollection', {
	useMongoClient: true
})
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.log(err));

// passport config
require('./config/passport')(passport);

app.get('/', (req, res) => {
	res.render('index');
});

// getting the 3 most recent polls when entering the page
app.get('/home', (req, res) => {
	var pollsArr = [];
	
	Poll.find({})
		.sort({time: -1})
		.limit(3)
		.then(polls => {
			polls.forEach((poll) => {
				pollsArr.push({title: poll.title, id: poll._id});
			});	

			res.render('home', {polls: pollsArr});
		})
});

// setting up routes
app.use('/users/', users);
app.use('/polls/', polls);

app.listen(port);