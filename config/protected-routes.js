var path = require("path");
var express = require("express");
var passport = require('passport');
var config = require('../config/database'); // get db config file
// var User = require('../app/models/user'); // get the mongoose model
var Admin = require('../app/models/admin'); // get the mongoose model
var jwt = require('jwt-simple');

// bundle our routes
var protectedRoutes = express.Router();

// parse out the auth token
var getToken = function(token) {
    if (token && (typeof token === "string")) {
        var parted = token.split(" ");
        return ((parted.length === 2) ? parted[1] : null);
    } else {
        return null;
    }
}

var cookieExtractor = function(req) {
    var token = null;
    console.log("THIS IS A REQUEST!!!");
    console.log(req);
    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }
    return token;
};

// ensure user is authenticated
// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) { return next(null); }
//   res.redirect('/api/login')
// }

// protected routes
// protectedRoutes.get(
//     "api/p/list",
//     passport.authenticate("jwt", { session: false, failureRedirect: "/api/login" }),
//     function(req, res) {
//         var token = getToken(req.headers);
//         if (token) {
// var decoded = jwt.decode(token, config.secret);
// Admin.findOne({
//     name: decoded.name
// }, function(err, admin) {
//     if (err) {
//         throw err;
//     }
//     if (!admin) {
//         return res.status(403).send({ success: false, msg: 'Authentication failed.' });
//     } else {
//         // Can be redirected here, its basicly the entrance to secured area
//         // res.json({ success: true, msg: 'Welcome to api list ' + admin.name + '!' });
//         res.sendFile(path.resolve("./frontend/dist/api-list.html"));
//     }
// });
//         } else {
//             return res.status(403).send({ success: false, msg: "No token provided." });
//         }
//     });

// route middleware to verify a token
protectedRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    // var token = req.body.token || req.query.token || req.headers['x-access-token'];

    var token = getToken(cookieExtractor(req));

    console.log("\n");
    console.log(token);
    console.log("\n");

    // decode token
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
                // res.json({ success: true, msg: 'Welcome to api list ' + admin.name + '!' });
                res.sendFile(path.resolve("./frontend/dist/api-list.html"));
                next();
            }
        });

        // verifies secret and checks exp
        // jwt.verify(token, config.secret, function(err, decoded) {
        //     if (err) {
        //         return res.json({ success: false, message: 'Failed to authenticate token.' });
        //     } else {
        //         // if everything is good, save to request for use in other routes
        //         req.decoded = decoded;
        //         next();
        //     }
        // });

    } else {

        return res.status(403).send({
            success: false,
            message: "No token provided."
        });
    }
});

protectedRoutes.get("/list", function(req, res) {
        res.sendFile(path.resolve("./frontend/dist/api-list.html"));
});

module.exports = protectedRoutes;
