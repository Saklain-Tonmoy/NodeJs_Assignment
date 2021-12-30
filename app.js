
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var rateLimit = require('express-rate-limit');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// var limiter = rateLimit({
//   windowMs: 10 * 1000, // 10 seconds to Milliseconds
//   max: 1,
//   message: "You can only request after 10 seconds.",
//   // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// app.use(limiter);

app.use('/', indexRouter);
// app.use('/api/', apiLimiter, indexRouter);
app.use('/users', usersRouter);

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
