var express = require('express');
require('dotenv').config();
var debug = require('debug')('app');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var session = require('express-session');
var mySQLStore = require('express-mysql-session');
var cors = require('cors');
var compression = require('compression');
var debug = require('debug')('app');
var app = express();

/* enable cors
var originConfig = require('./backend/config/cors');
app.use(cors({
    credentials: true,
    origin: originConfig.origin
})); 
*/

// enable gzip compression
app.use(compression());

// routes
var index = require('./backend/components/routes');

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');


// your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// logger

if (app.get('env') != 'test' && app.get('env') != 'production') {
    //app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
app.use(
	sass({
		src: __dirname + '/public/stylesheets/sass', 
    dest: __dirname + '/public/stylesheets',
    debug: true,
    prefix: '/stylesheets', 
	})
);
*/
// session store
var pool = require('./backend/config/db').pool;
var sessionStore = new mySQLStore({}, pool);

// session
app.use(session({
    key: (process.env.SESSION_KEY) ? process.env.SESSION_KEY : 'hans_solo',
    secret: (process.env.SESSION_SECRET) ? process.env.SESSION_SECRET : 'millenium_balkon',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(error, req, res, next) {
    // set locals, only providing error in development
    //res.locals.message = err.message;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500).json(error);
    //res.render('error');
});

module.exports = app;
