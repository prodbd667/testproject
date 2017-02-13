var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');

var config = require('./config/config');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var checkAuth = require('./middleware/checkAuth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'testproject',
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: null
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
app.use('/users', users);

var connection = mysql.createConnection({
  host: config.dbmysql.host,
  user: config.dbmysql.user,
  password: config.dbmysql.password,
  database: config.dbmysql.database
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

// function getUserDB(username, done) {
//   connection.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username], function (err, rows, fields) {
//     if (err) throw err;
//     done(rows[0]);
//   });
// }

app.get('/', function (req, res) {
  res.render('hello');
});



app.get('/login', function (req, res) {
  res.render('main');
});


app.post('/login', function (req, res) {

  if (!req.body.login || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  connection.query('SELECT * FROM users WHERE login = ? LIMIT 1', [req.body.login], function (err, rows, fields) {
    if (err) throw err;

    if (!rows[0]) {
      return res.status(401).send("The username is not existing");
    }
    if (rows[0].password !== req.body.password) {
      return res.status(401).send("The username or password don't match");
    }



    req.session.role = rows[0].role;
    res.status(201).redirect('/table');

  });

});

app.get('/table', checkAuth, function (req, res) {
  console.log(req.session.role);
  switch (req.session.role) {
    case 'role_first':
      res.send('first')
      break
    case 'role_second':
      connection.query('SELECT * FROM records', function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        rating = [1, 2, 3, 4, 5];
        res.render('s_r_table', { role: 'second role', records: rows })
      })
      break
    default:
      console.log('test');
      break
  }
});


app.post('/table/voting', function (req, res) {
// var sqlQuery = ;

console.log(req.body);
  connection.query("UPDATE records SET ? WHERE ?", [{ evaluation: req.body.evaluation }, { id: req.body.id }], function (error, data) {
    if (error) throw error;

    res.json(data);
  });
});


app.get('/test', function (req, res) {
  // req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
  // res.send("visits " + req.session.numberOfVisits);

  var sqlQuery = "SELECT * FROM users";
  connection.query(sqlQuery, function (error, data) {
    if (error) throw error;

    res.json(data);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
