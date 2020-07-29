var path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

module.exports = function pimpMyExpress(app) {

    var routes = [],
        beforeFilters = [],
        afterFilters = [];

    app.scanRoutes = function scanRoutes(p) {

        fs.readdirSync(p).forEach(function (f) {

            var file = path.join(p, f);

            var fileStats = fs.statSync(file);

            if (fileStats.isDirectory()) {

                app.scanRoutes(file);

            } else {

                console.log('Adding route: ' + file.replace(process.cwd(), ''));

                routes.push(file);

            }

        });

    };

    app.before = function before() {

        var callbacks = _.flatten(arguments);

        beforeFilters = beforeFilters.concat(callbacks);

    };

    app.after = function after() {

        var callbacks = _.flatten(arguments);

        afterFilters = afterFilters.concat(callbacks);

    };

    app.pimpIt = function pimpIt() {

        function initializeObjects(req, res, next) {

            res.content = { headers: {} };

            req.$ = {};

            next();

        }

        function mergeDependencies(req, res, next) {

            req.$ = _.merge(_.merge({}, app.$), req.$)

            next();

        }

        // Callback that handles response in case res.content is used
        function deferredResponse(req, res) {

            if (!res.headerSent) {

                res.content.redirect && res.redirect(res.content.redirect);

                res.set(res.content.headers);

                res.send(res.content.body);

            }

        }

        // Adding routes
        _.forEach(routes, function (route) {
            try {
                require(route)(app);
            } catch (e) {
                console.log('Error adding route: ', route, e);
            }

        });

        // Adding before / after filters
        _.forEach(app.routes, function (routes) {

            _.forEach(routes, function (route) {

                beforeFilters.push(mergeDependencies);

                route.callbacks = beforeFilters.concat(route.callbacks);

                route.callbacks.unshift(initializeObjects);

                route.callbacks = route.callbacks.concat(afterFilters);

                route.callbacks.push(deferredResponse);

            });

        });

    };

    return app;

};