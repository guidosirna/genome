var bunyan = require('bunyan');
var uuid = require('node-uuid');

module.exports = function (app) {

    global.logger = bunyan.createLogger(global.LOGGER_SETTINGS);

    app.before(function (req, res, next) {

        req.$.id = uuid.v4();

        req.$.logger = global.logger.child({req_id: req.$.id});

        next();

    });

};