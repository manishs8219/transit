 var createError = require('http-errors');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require( "socket.io" )( http );
const passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const fileupload = require('express-fileupload')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api_routes');
var flash = require('express-flash');
var bodyParser = require('body-parser')








  require('./socket')(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'XCR3rsasa%RDHHH',
  cookie: {
    maxAge: 900000000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

// var port = 7000
var port = Number(process.env.PORT || 7000);




http.listen(port,()=>{
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;

