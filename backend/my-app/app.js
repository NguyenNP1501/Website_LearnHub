var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 1. THÊM DÒNG NÀY: Import thư viện cors
var cors = require('cors'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var coursesRouter = require('./routes/courses');
var lessonsRouter = require('./routes/lessons');
var authRouter = require('./routes/auth');

var app = express();

// 2. THÊM ĐOẠN NÀY: Cấu hình CORS ngay dưới dòng var app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Chấp nhận request từ Frontend Vite
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/auth', authRouter);
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