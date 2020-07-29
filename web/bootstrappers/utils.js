var graph = require('fbgraph');

module.exports = function (app) {

    console.logJson = function (obj) {
        console.log(JSON.stringify(obj, null, 4));
    };

    app.before(function (req, res, next) {



        next();

    });

};