var _ = require('lodash');

module.exports = function (app) {

    app.get('/me', app.$.ensureAuthenticated, function (req, res, next) {

        res.content.body = res.renderViewSync('me.ect');

        next();

    });

    app.get('/me/data', app.$.ensureAuthenticated, function (req, res, next) {

        var esClient = app.$.esClient;

        console.log(req.user.id);

        var subject_data = esClient.getSourceSync(global.ES_TYPES('subjects', {id: req.user.id, ignore: [404]}));

        _(subject_data.sg_genes).forEach(function (gene) {
            gene.likehood = gene.likehood * 100;
        })

        res.content.body = subject_data;

        next();

    });

    app.get('/me/login', function (req, res, next) {

        res.content.body = res.renderViewSync('login.ect');

        next();

    });

}