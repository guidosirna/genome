var domain = require('domain');

var middleware = module.exports = function (req, res, next) {

    var d = domain.create();
    d.id = middleware.id();
    d.add(req);
    d.add(res);
    d.run(function () {
        next();
    });
    d.on('error', function (e) {
        next(e);
    });

};

var count = 0;

middleware.id = function () {
    return count++;
};
