module.exports = function (app) {

    app.before(function (req, res, next) {
        global.sync.fiber(next);
    });

};