var sync = global.sync;
var elasticsearch = require('elasticsearch');
var synchronizer = require('helpers/synchronizer');

module.exports = function (app) {

    app.$.esClient = new elasticsearch.Client({
        host: global.ES_HOST
    });
    synchronizer(app.$.esClient);
    synchronizer(app.$.esClient.indices);
    synchronizer(app.$.esClient.nodes);

    global.esClient = app.$.esClient;

};