var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session');


var routes = require('./routes/index');
var login_register = require('./routes/login_register');
var friends_panel = require('./routes/friends_panel');
var room_list = require('./routes/room_list');
var chat_list = require('./routes/chat_list');
var user = require('./routes/user');
var cfg = require('./cfg');




global.Util = require('./public/js/Util');

// 全局model操作器 
global.modelHandle = require('./dbs/getModel').getModel;
// 全局数据库对象
console.log('db-uri: ' + cfg.server.uri);
global.db = mongoose.connect(cfg.server.uri);

var app = express();

// 定义session有效期
app.use(session({
  secret: 'secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// view engine setup with html
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login_register', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'views/login_register.html'));
})
.get('/friends_panel', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'views/friends_panel.html'));
});


app.use('/', routes);
app.use('/', login_register);
app.use('/', friends_panel);
app.use('/', room_list);
app.use('/', chat_list);
app.use('/', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
