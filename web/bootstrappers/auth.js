var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var sessionStore = require('connect-elasticsearch')(express);

module.exports = function (app) {

    app.$.ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            if (req.xhr) {
                res.send(403);
            } else {
                var return_url = '/me/login';
                if (req.query.return_url) {
                    return_url = req.query.return_url;
                }
                res.redirect(return_url);
            }
        }
    }

    app.before(express.session({
        secret: '6aa62cf2-630d-4806-88d8-a93c78df6f39',
        store: new sessionStore({
            client: app.$.esClient,
            index: global.ES_TYPES['sessions'].index,
            type: 'sessions',
            ttl: '30m'
        })
    }));

    app.before(passport.initialize());
    app.before(passport.session());

    passport.use(new FacebookStrategy(global.FB,
        function (accessToken, refreshToken, profile, done) {

            var processorHelper = require('helpers/processor');

            processorHelper.retrieveSubjectAsync(profile.id, function (err, raw_subject) {

                processorHelper.processSubjectAsync(raw_subject, function (err, results) {

                    done(null, profile);

                });

            });

        }

    ));

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_likes'] }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/me', failureRedirect: '/me/login' }));

    passport.serializeUser(function (user, done) {

        done(null, user);

    });

    passport.deserializeUser(function (user, done) {

        done(null, user);

    });

};
