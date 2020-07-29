
module.exports = function (app) {

    app.get('/', function (req, res, next) {

        res.content.body = res.renderViewSync('index.ect');

        next();

    });

}