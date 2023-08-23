// const passport = require('passport');
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJWT = require('passport-jwt').ExtractJwt;
// const helper = require('../helper/helpers');
// const models = require('../models');
// const db = require('../models');
// const user = db.user;
// Setup options for JWT Strategy
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const helper = require('../helper/helpers');
const db = require('../models');
var jwtSecretKey = 'RaAsJaAfJdRaAdJfPaU1T2';
const users = db.users;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = jwtSecretKey;


passport.use('users', new JwtStrategy(jwtOptions,
    async function (payload, done) {
        try {

            const existingUser = await users.findOne({
                where: {
                    id: payload.id,
                    login_time: payload.login_time
                }
            });
            if (existingUser) {
                console.log(existingUser.dataValues, '===============>loggedInUser');
                return done(null, existingUser.dataValues);
            }
            return done(null, false);
        } catch (e) {
            console.log('not local');
            console.log(e);
            // return done(e, false);
        }
    }
));

module.exports = {
    initialize: function () {
        return passport.initialize();
    },
    authenticateUser: function (req, res, next) {
        return passport.authenticate("users", {
            session: false
        }, (err, user, info) => {
            // console.log(err, '=======================>passport err');
            // console.log(info, '=======================>passport info');
            // console.log(info && info['name'], '=======================>passport info[name]');
            // console.log(user, '=======================>passport err user');
            console.log(user);
            if (err) {
                return helper.error(res, err);
            }
            if (info && info.hasOwnProperty('name') && info.name == 'JsonWebTokenError') {
                return helper.error(res, {

                    message: 'Invalid Token.'
                });
            } else if (user == false) {
                return helper.error(res, {
                    code: 401,

                    message: 'Authorization is required.'
                });
            }
            // Forward user information to the next middleware
            req.auth = user;
            next();
        })(req, res, next);
    },

};