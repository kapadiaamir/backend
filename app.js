//dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session); 
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); 
//load environments
var env = (function(){
  var HB  = require('habitat'); 
  HB.load('env/defaults.env'); 
  HB.load('env/' + process.env.ENV + '.env');
  return new HB();
}());

var studentPassport = require('./config/passport-student');
var landlordPassport = require('./config/passport-landlord');

//app
var app = express();

//database connection
mongoose.connect(env.get('DB_URL'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookie(env.get('COOKIE_SECRET')));
app.use(session({
  secret: env.get('COOKIE_SECRET'), 
  resave: true, 
  saveUninitialized: true,
  store: new mongoStore({ url : env.get('DB_URL'), db : env.get('SESSION_STORE') })
}));
app.use(studentPassport.initialize());
app.use(studentPassport.session()); 
app.use(landlordPassport.initialize()); 
app.use(landlordPassport.session());


//routes
var routes = require('./routes/index');
var students = require('./routes/students');
var landlords = require('./routes/landlords');

app.use('/', routes);
app.use('/students', students);
app.use('/landlords', landlords);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (env.get('NODE_ENV') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


module.exports = app;
