var express = require("express");
var passport = require('passport');
var config = require('../config/database'); // get db config file
var User = require('../app/models/user'); // get the mongoose model
var jwt = require('jwt-simple');

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST localhost:5000/api/signup)
apiRoutes.post("/signup", function(req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, msg: "Please pass name and password." });
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });

        newUser.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: "Username already exists." });
            }
            res.json({ success: true, msg: "Successful created new user." });
        });
    }
});

// authenticate user to the app
apiRoutes.post("/login", function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) {
            throw err;
        }

        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password matches
                    var token = jwt.encode(user, config.secret);
                    res.json({ success: true, token: "JWT " + token });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            })
        }
    })
});

module.exports = apiRoutes;