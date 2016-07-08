var path = require("path");
var express = require("express");
var config = require('../config/database'); // get db config file
var User = require('../app/models/user');
var jwt = require('jsonwebtoken');

var cookie = {
    path: "/",
    name: "jwt"
};

function cookieExtractor(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }
    return token;
};

function isAuthenticated(req, res, next) {
    if (req.cookies.jwt) {
        return next();
    }

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    return res.status(401).json({ success: false, msg: "Requires auth token" });
}

// bundle our routes
var apiRoutes = express.Router();

// demo route get base
apiRoutes.get("/", function(req, res) {
    if (req.cookies.jwt) {
        res.redirect("/p/users");
    }

    res.sendFile(path.resolve("./frontend/dist/home.html"));
});

// demo route get base
apiRoutes.get("/login", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/login.html"));
});

apiRoutes.get('/logout', function(req, res) {
    // Remove all session cookies
    res.clearCookie(cookie.name, { path: cookie.path });

    res.redirect('/api/login');
});

// demo route get base
apiRoutes.get("/signup", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/signup.html"));
});


// authenticate user for API list
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
                    var token = jwt.sign(user, config.secret);

                    // Set token cookie
                    res.cookie(cookie.name, token, { path: cookie.path });

                    res.json({ success: true });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            })
        }
    })
});

apiRoutes.post("/signup", function(req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, msg: "Please pass name, password and secret key." });
    } else {

        if (req.body.permission && config.adminkey.toString() !== req.body.key.toString()) {
            return res.json({ success: false, msg: "Need a valid secret key." });
            throw err;
        }

        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            permission: req.body.permission
        });

        newUser.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: "Username already exists." });
            }
            res.json({ success: true, msg: "Successful created new user." });
        });
    }
});


// Additional routes

apiRoutes.get('/me', isAuthenticated, function(req, res) {

        var token = cookieExtractor(req);

        // decode token
        if (token) {
            var decoded = jwt.verify(token, config.secret);;
            User.findOne({
                name: decoded._doc.name
            }, function(err, user) {
                if (err) {
                    throw err;
                }
                if (!user) {
                    return res.status(403).send({ success: false, msg: 'No user found.' });
                } else {
                    res.json({ success: true, data: {name: user.name, is_admin: Boolean(user.permission)} });
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: "No user found."
            });
        }
});


apiRoutes.get('/users', isAuthenticated, function(req, res) {
    User.find({}, function(err, users) {
        var users_arr = [];

        users.forEach(function(user) {
            console.log(user);
            users_arr.push({
                id: user._id,
                name: user.name,
                notes: user.notes,
                is_admin: Boolean(user.permission),
                updated: user.updated
            });
        });

        res.json({ success: true, data: users_arr });
    });
});

module.exports = apiRoutes;
