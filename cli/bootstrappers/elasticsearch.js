var elasticsearch = require('elasticsearch');
var synchronizer = require('helpers/synchronizer');
var bunyan = require('bunyan');

var log = global.log;

function LogToBunyan(config) {
    var bun = global.log;
    var dummyFunc = function () {
    };

    this.warning = dummyFunc;
    this.info = dummyFunc;
    this.debug = dummyFunc;
    this.error = dummyFunc;
    this.close = dummyFunc;

    this.trace = function (method, requestUrl, body, responseBody, responseStatus) {
        if (responseStatus >= 400) {
            log.error('---ES ERROR --------------------');
            log.error('Method: ', method);
            log.error('Url: ', requestUrl.path);
            log.error('ResponseStatus: ', responseStatus);
            try {
                log.error('Request:\n', JSON.stringify(JSON.parse(body), null, 4));
                log.error('Response:\n', JSON.stringify(JSON.parse(responseBody), null, 4));
            } catch (e) {
            }
            log.error('/---ES ERROR --------------------');
        }
    };
}

global.esClient = new elasticsearch.Client({
    host: global.ES_HOST
});

synchronizer(global.esClient);
synchronizer(global.esClient.indices);