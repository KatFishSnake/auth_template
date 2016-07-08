var path = require("path");
var express = require("express");
var config = require('../config/database'); // get db config file
var User = require('../app/models/user'); // get the mongoose model
var jwt = require('jsonwebtoken');

// bundle our routes
var protectedRoutes = express.Router();

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }
    return token;
};

// route middleware to verify a token
protectedRoutes.use(function(req, res, next) {
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
                return res.status(403).send({ success: false, msg: 'Authentication failed.' });
            } else {
                // Can be redirected here, its basicly the entrance to secured area
                res.sendFile(path.resolve("./frontend/dist/users.html"));
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: "No token provided."
        });
    }
});

protectedRoutes.get("/users", function(req, res) {
    res.sendFile(path.resolve("./frontend/dist/users.html"));
});

module.exports = protectedRoutes;
