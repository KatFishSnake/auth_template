var path = require("path");
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/database'); // get db config file
var User = require('./app/models/user'); // get the mongoose model
var port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');

var apiRoutes = require("./config/api-routes");
var protectedRoutes = require("./config/protected-routes");

// get requests params
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

// log to console
app.use(morgan("dev"));

// publicly exposse this path
app.use("/", express.static(path.resolve("./frontend")));

// connect to db
mongoose.connect(config.database);

app.get("/", function(req, res) {
    res.redirect("/api");
});

app.use("/api", apiRoutes);
app.use("/p", protectedRoutes);

app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
