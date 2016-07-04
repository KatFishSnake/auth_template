var path = require("path");
var express = require("express");
var passport = require('passport');
var config = require('../config/database'); // get db config file
var User = require('../app/models/user'); // get the mongoose model
var jwt = require('jwt-simple');

// bundle our routes
var appRoutes = express.Router();

// parse out the auth token out of request headers
var getToken = function (headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(" ");
		return ((parted.length === 2) ? parted[1] : null);
	}
	else {
		return null;
	}
}

// demo route get base
appRoutes.get("/", function(req, res) {
    // Check local storage for tocken, then validate it if its there
    res.redirect("/login");
});

// demo route get base
appRoutes.get("/login", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/login.html"));
});

// demo route get base
appRoutes.get("/signup", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/signup.html"));
});

// protected routes
appRoutes.get("/proute", passport.authenticate("jwt", { session: false }), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.name
        }, function(err, user) {
            if (err) {
                throw err; }

            if (!user) {
                return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
            } else {

                // Can be redirected here, its basicly the entrance to secured area
                res.json({ success: true, msg: 'Welcome in the member area ' + user.name + '!' });
            }
        });
    } else {
        return res.status(403).send({ success: false, msg: "No token provided." });
    }
});

module.exports = appRoutes;