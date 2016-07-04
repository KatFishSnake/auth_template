var path = require("path");
var express = require("express");
var passport = require('passport');
var config = require('../config/database'); // get db config file
var User = require('../app/models/user'); // get the mongoose model
var Admin = require('../app/models/admin'); // get the mongoose model
var jwt = require('jwt-simple');

// bundle our routes
var apiRoutes = express.Router();

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
apiRoutes.get("/", function(req, res) {
    // Check local storage for tocken, then validate it if its there
    res.redirect("/login");
});

// demo route get base
apiRoutes.get("/login", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/admin-login.html"));
});

// demo route get base
apiRoutes.get("/signup", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/admin-signup.html"));
});

// protected routes
apiRoutes.get("/p/list", passport.authenticate("jwt", { session: false }), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Admin.findOne({
            name: decoded.name
        }, function(err, admin) {
            if (err) {
                throw err; 
            }

            if (!admin) {
                return res.status(403).send({ success: false, msg: 'Authentication failed.' });
            } else {

                // Can be redirected here, its basicly the entrance to secured area
                res.json({ success: true, msg: 'Welcome to api list ' + admin.name + '!' });
            }
        });
    } else {
        return res.status(403).send({ success: false, msg: "No token provided." });
    }
});

// authenticate admin for API list
apiRoutes.post("/admin-login", function(req, res) {
    Admin.findOne({
        name: req.body.name
    }, function(err, admin) {
        if (err) {
            throw err;
        }

        if (!admin) {
            res.send({ success: false, msg: 'Authentication failed. Admin not found.' });
        } else {
            // check if password matches
            admin.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // if admin is found and password matches
                    var token = jwt.encode(admin, config.secret);
                    res.json({ success: true, token: "JWT " + token });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            })
        }
    })
});

// create a new admin account (POST localhost:5000/api/admin-signup)
apiRoutes.post("/admin-signup", function(req, res) {
    if (!req.body.name || !req.body.password || !req.body.key) {
        res.json({ success: false, msg: "Please pass name, password and secret key." });
    } else {

        if (config.adminkey.toString() !== req.body.key.toString()) {
            return res.json({ success: false, msg: "Need a valid secret key." });
            throw err; 
        }

        var newAdmin = new Admin({
            name: req.body.name,
            password: req.body.password
        });

        newAdmin.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: "Username already exists." });
            }
            res.json({ success: true, msg: "Successful created new admin." });
        });
    }
});

module.exports = apiRoutes;