var path = require("path");
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database'); // get db config file
var User = require('./app/models/user'); // get the mongoose model
var port = process.env.PORT || 5000;
var jwt = require('jwt-simple');

var apiRoutes = require("./config/api-routes");
var appRoutes = require("./config/app-routes");
var protectedRoutes = require("./config/protected-routes");

// get requests params
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

// log to console
app.use(morgan("dev"));

// use passportjs for simpler auth
app.use(passport.initialize());

// publicly exposse this path
app.use("/", express.static(path.resolve("./frontend")));

// connect to db
mongoose.connect(config.database);

// pass passport for configuration
require("./config/passport")(passport);

app.use("/", appRoutes);
app.use("/api", apiRoutes);
app.use("/api/p", protectedRoutes);

app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
