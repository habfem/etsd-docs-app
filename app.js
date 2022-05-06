const path = require('path');
const express = require('express');
//const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
//const bodyParser = require("body-parser");


// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
})
)

//Logging in
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs');

//Handlebars
app.engine('.hbs', exphbs.engine({ helpers: { formatDate, stripTags, truncate, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
  secret: 'keyboard cat', // you can set your secret to anything
  resave: false,
  saveUninitialized: false, // don't create a session until something is stored
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://xxxxxxxxxxxxxxxxxxxxxxxxxxx:xxxxxxxx@testcluster1.ueiur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'})
  //cookie: { secure: true } cookie does not work without https
}));

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

//Static folder usually to specify where our CSS will be
app.use(express.static(path.join(__dirname, 'public'))) // folder will be named public

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/docs', require('./routes/docs'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
