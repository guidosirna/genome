var sync = global.sync;
var await = sync.await;
var defer = sync.defer;
var defers = sync.defers;
var _ = require('lodash');
var util = require('util');
var path = require('path');
var objectUtils = require('mout/object');
var stringUtils = require('mout/string');
var jsUtils = require('mout/lang');
var moment = require('moment');
var fs = require('fs');
var esDslHelper = require('helpers/esdsl-helper');
var processorHelper = require('helpers/processor');
var fbHelper = require('helpers/facebook');
var graph = require('fbgraph');
var synchronizer = require('helpers/synchronizer');
var ProgressBar = require('progress');
var math = require('mathjs');

function FacebookLib(options) {

    var self = this;

    synchronizer(graph);

    objectUtils.deepMixIn(self, options);

};

FacebookLib.prototype.retrieveSubjects = function (options) {

    var self = this;

    if (!options) {
        options = {};
    }

    var exit = options.exit == undefined ? true : exit;

    global.sync.fiber(function () {

        var esClient = global.esClient;
        var log = global.log;
        var accessToken = fbHelper.getAccessToken();
        graph.setAccessToken(accessToken);

        var q = esDslHelper()
            .setSort('id', 'asc')
            .addMatchAll();

        q.scroll = '12h';

        var scrollResponse = esClient.searchSync(global.ES_TYPES('raw_subjects', q));

        var scrollId = scrollResponse._scroll_id;

        var count = 1;

        log.info('Retrieving %s subjects', scrollResponse.hits.total);
        log.info('');


        var bar = new ProgressBar('Processing :current of :total [:bar] :percent :etas, elapsed so far :elapseds', { total: scrollResponse.hits.total, width: 50 });

        while (scrollResponse.hits.total >= count) {

            _(scrollResponse.hits.hits).forEach(function (hit) {

                bar.tick();

                try {

                    processorHelper.retrieveSubject(hit._id);


                } catch (e) {

                    log.error(util.format('Error processing subject id %s: %s', hit._source.id, JSON.stringify(e)));

                }

                count++;

            });

            scrollResponse = esClient.scrollSync(ES_TYPES('subjects', {scroll: '12h', scrollId: scrollId}));

        }

        if (exit) {

            process.exit(0);

        }

    });

};

FacebookLib.prototype.processSubjects = function (options) {

    var self = this;

    if (!options) {
        options = {};
    }

    var exit = options.exit == undefined ? true : exit;


    global.sync.fiber(function () {

        var esClient = global.esClient;

        var log = global.log;

        var q = esDslHelper()
            .setSort('id', 'asc')
            .addMatchAll();

        q.scroll = '12h';

        var scrollResponse = esClient.searchSync(global.ES_TYPES('raw_subjects', q));

        var scrollId = scrollResponse._scroll_id;

        var count = 1;

        esClient.deleteByQuerySync(global.ES_TYPES('subjects', {
            body: {
                query: {
                    match_all: {}
                }
            }
        }));

        log.info('Processing %s raw subjects', scrollResponse.hits.total);

        log.info('');

        var bar = new ProgressBar('Processing :current of :total [:bar] :percent :etas, elapsed so far :elapseds', { total: scrollResponse.hits.total, width: 50 });

        var sg_categories_catalog = _(esClient.searchSync(global.ES_TYPES('sg_categories', esDslHelper().setSize(1000))).hits.hits)
            .map(function (hit) {
                return hit._source;
            });

        var sg_genes_catalog = _(esClient.searchSync(global.ES_TYPES('sg_genes', esDslHelper().setSize(1000))).hits.hits)
            .map(function (hit) {
                return hit._source;
            });

        while (scrollResponse.hits.total >= count) {

            _(scrollResponse.hits.hits).forEach(function (hit) {

                bar.tick();

                try {

                    var raw_subject = hit._source;

                    processorHelper.processSubject(raw_subject, sg_categories_catalog, sg_genes_catalog);

                } catch (e) {

                    log.error(util.format('Error processing subject id %s: %s', hit._source.id, JSON.stringify(e)));

                }

                count++;

            });

            scrollResponse = esClient.scrollSync(ES_TYPES('raw_subjects', {scroll: '12h', scrollId: scrollId}));

        }

        if (exit) {

            process.exit(0);

        }

    });


};

FacebookLib.prototype.retrieveGenes = function (options) {

    var self = this;

    if (!options) {
        options = {};
    }

    var exit = options.exit == undefined ? true : exit;

    global.sync.fiber(function () {

        var esClient = global.esClient;

        var log = global.log;

        var q = esDslHelper()
            .setSort('id', 'asc')
            .setSize(100);

        var genes = _(esClient.searchSync(global.ES_TYPES('sg_genes', q)).hits.hits)
            .map('_source')
            .value();

        var sg_categories_catalog = _(esClient.searchSync(global.ES_TYPES('sg_categories', esDslHelper().setSize(1000))).hits.hits)
            .map(function (hit) {
                return hit._source;
            });

        _(genes).forEach(function (gene) {

            log.info('Retrieving gene %s with %s tipical likes', gene.name, gene.tipical_likes.length);

            gene.fb_categories = [];

            _(gene.tipical_likes).forEach(function (page) {

                log.info('\tProcessing %s', page);

                try {

                    var id = page.replace('https://www.facebook.com/', '');

                    var pageData = graph.getSync(id);

                    if (pageData.category) {

                        gene.fb_categories.push(pageData.category);

                    }

                } catch (e) {

                    log.error(e);

                }

            });

            esClient.indexSync(global.ES_TYPES('sg_genes', {body: gene}));

        });

        if (exit) {

            process.exit(0);

        }

    });

};

FacebookLib.prototype.processGenes = function (options) {

    var self = this;

    if (!options) {
        options = {};
    }

    var exit = options.exit == undefined ? true : exit;

    global.sync.fiber(function () {

        var esClient = global.esClient;

        var log = global.log;

        var q = esDslHelper()
            .setSize(100);

        var genes = _(esClient.searchSync(global.ES_TYPES('sg_genes', q)).hits.hits)
            .map('_source')
            .value();

        var sg_categories_catalog = _(esClient.searchSync(global.ES_TYPES('sg_categories', q)).hits.hits)
            .map('_source')
            .value();

        _(genes).forEach(function (gene) {

            log.info('Processing gene %s', gene.name);

            var sg_category_ids = [];

            _(gene.fb_categories).forEach(function (gene_fb_cat) {

                _(sg_categories_catalog).filter(function (sg_cat) {

                    return _(sg_cat.fb_categories).contains(gene_fb_cat);

                }).forEach(function (sg_cat) {

                    sg_category_ids.push(sg_cat.id);

                });

            });

            var grouped = _(sg_category_ids).countBy(function (id) {

                return id;

            }).value();

            gene.sg_categories = _(objectUtils.keys(grouped)).map(function (key) {

                var qty = grouped[key];

                return {
                    id: key,
                    name: _(sg_categories_catalog).find({id: key}).name,
                    likehood: (100 / sg_category_ids.length * qty / 100)
                };

            }).value();

            esClient.indexSync(global.ES_TYPES('sg_genes', {body: gene}));

        });

        if (exit) {

            process.exit(0);

        }

    });

};

module.exports = function (options) {

    return new FacebookLib(options);

}