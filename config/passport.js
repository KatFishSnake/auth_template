var JwtStrategy = require("passport-jwt").Strategy;

// load up the user model
var User = require("../app/models/user");
var Admin = require("../app/models/admin");
var config = require("../config/database");

module.exports = function(passport) {
    var opts = {};

    // `cookieExtractor` returns the correct token 
    var cookieExtractor = function(req) {
        var token = null;
        console.log("THIS IS A REQUEST!!!");
        console.log(req);
        if (req && req.cookies) {
            token = req.cookies["jwt"];
        }
        return token;
    };

    opts.secretOrKey = config.secret;
    opts.jwtFromRequest = cookieExtractor;  

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Admin.findOne({ id: jwt_payload.id }, function(err, user) {
            if (err) {
                return done(err, false);
            }

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));

    // passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    //     User.findOne({ id: jwt_payload.id }, function(err, user) {
    //         if (err) {
    //             return done(err, false);
    //         }

    //         if (user) {
    //             done(null, user);
    //         } else {
    //             done(null, false);
    //         }
    //     });
    // }));
};
