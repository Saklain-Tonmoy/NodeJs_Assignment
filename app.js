
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// requiring express-rate-limit. this must be below the ### var app = express();
const rateLimit = require('express-rate-limit');
const router = require('./routes/users');

// this function is handling what will happen when the limit is reached
const limitReached = (req, res) => {
  res.render('forbidden', { message: "Too many requests. You can request once in 10 seconds."});
};

// initializing express-rate-limit
const apiRequestLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 2, // limit each IP to 2 requests per windowMs
  // expireTimeMs: 10 * 1000,
  resetTime: 10 * 1000, // resets after 10 seconds
  handler: limitReached,
});

// difining that, the app can use apiRequestLimiter
app.use('/', apiRequestLimiter, indexRouter);

// router.use(apiRequestLimiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
