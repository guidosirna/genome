var _ = require('lodash');
var esDslHelper = require('helpers/esdsl-helper');
var math = require('mathjs');

module.exports = function (app) {

    app.get('/api/:appId/:userId/genome', function (req, res, next) {

        var esClient = app.$.esClient;

        var subject = esClient.getSourceSync(global.ES_TYPES('subjects', {id: req.params.userId, ignore: [404]}));

        if (!subject) {

            res.send(404);
            next();
            return;

        }

        if (!subject.sg_categories) {

            res.status(202);
            res.content.body = {
                statusMessage: {
                    status: 'scraping'
                }
            };
            next();
            return;

        }

        res.content.body = {
            genome: subject.sg_categories
        };

        next();

    });

    app.get('/api/charts/all', function (req, res, next) {

        var esClient = app.$.esClient;

        var q = {
            index: 'sg',
            type: 'subjects',
            body: {
                "size": 0,
                "aggs": {
                    "gene_stats": {
                        "terms": {
                            "field": "main_gene.name.value_na",
                            "size": 100
                        }
                    },
                    "gene_type_stats": {
                        "terms": {
                            "field": "main_gene.type",
                            "size": 100
                        }
                    },
                    "scraping_stats": {
                        "filter": {
                            "exists": {
                                "field": "sg_categories"
                            }
                        }
                    },
                    "gender_stats": {
                        "terms": {
                            "field": "gender",
                            "size": 2
                        }
                    },
                    "sg_categories_stats": {
                        "terms": {
                            "field": "sg_categories.name.value_na",
                            "size": 10
                        }
                    },
                    "fb_categories_stats": {
                        "terms": {
                            "field": "fb_categories.value_na",
                            "size": 10
                        }
                    },
                    "gender_sg_categories_stats": {
                        "terms": {
                            "field": "gender",
                            "size": 3
                        },
                        "aggs": {
                            "cats": {
                                "terms": {
                                    "field": "sg_categories.name.value_na",
                                    "size": 10
                                }
                            }
                        }
                    },
                    "gender_fb_categories_stats": {
                        "terms": {
                            "field": "gender",
                            "size": 3
                        },
                        "aggs": {
                            "cats": {
                                "terms": {
                                    "field": "fb_categories.value_na",
                                    "size": 10
                                }
                            }
                        }
                    }
                }
            }
        };

        var results = esClient.searchSync(q);

        res.content.body = {
            gene_stats: _(results.aggregations.gene_stats.buckets)
                .map(function (bucket) {
                    return {
                        label: bucket.key,
                        value: bucket.doc_count
                    };
                }).value(),
            gene_type_stats: _(results.aggregations.gene_type_stats.buckets)
                .map(function (bucket) {
                    return {
                        label: bucket.key,
                        value: bucket.doc_count
                    };
                }).value(),
            scraping_stats: [
                {
                    label: 'Pending',
                    value: results.hits.total - results.aggregations.scraping_stats.doc_count
                },
                {
                    label: 'Scraped',
                    value: results.aggregations.scraping_stats.doc_count
                }
            ],
            gender_stats: _(results.aggregations.gender_stats.buckets)
                .map(function (bucket) {
                    return {
                        label: bucket.key,
                        value: bucket.doc_count
                    };
                }).value(),
            sg_category_stats: _(results.aggregations.sg_categories_stats.buckets)
                .map(function (bucket) {
                    return {
                        label: bucket.key,
                        value: bucket.doc_count
                    };
                }).value(),
            fb_category_stats: _(results.aggregations.fb_categories_stats.buckets)
                .map(function (bucket) {
                    return {
                        label: bucket.key,
                        value: bucket.doc_count
                    };
                }).value(),
            gender_sg_category_stats: _(results.aggregations.gender_sg_categories_stats.buckets)
                .map(function (bucket) {
                    return {
                        key: bucket.key,
                        values: _(bucket.cats.buckets).map(function (cat) {
                            return {
                                label: cat.key,
                                value: cat.doc_count
                            };
                        }).value()
                    };
                }).value(),
            gender_fb_category_stats: _(results.aggregations.gender_fb_categories_stats.buckets)
                .map(function (bucket) {
                    return {
                        key: bucket.key,
                        values: _(bucket.cats.buckets).map(function (cat) {
                            return {
                                label: cat.key,
                                value: cat.doc_count
                            };
                        }).value()
                    };
                }).value()
        };

        next();

    });

    app.get('/api/statistical/euclidean_distance/:userId1/:userId2?', function (req, res, next) {

        var esClient = app.$.esClient;

        var user1 = esClient.getSourceSync(global.ES_TYPES('subjects', {id: req.params.userId1, ignore: [404]}));
        var user2 = esClient.getSourceSync(global.ES_TYPES('subjects', {id: req.params.userId2, ignore: [404]}));

        if (!user1 || !user1.sg_categories) {
            res.content.body = 'No valid user1';
            res.send(404);
            next();
            return;
        }

        if (!user2 || !user2.sg_categories) {
            res.content.body = 'No valid user2';
            res.send(404);
            next();
            return;
        }

        var matchedCategories = [];

        _(user1.sg_categories).forEach(function (cat) {
            if (!_(matchedCategories).find(cat.id)) {
                matchedCategories.push(cat.id);
            }
        });

        _(user2.sg_categories).forEach(function (cat) {
            if (!_(matchedCategories).find(cat.id)) {
                matchedCategories.push(cat.id);
            }
        });

        var similarity = 0;

        if (matchedCategories.length > 0) {

            _(matchedCategories).map(function (catId) {

                var catUser1 = _(user1.sg_categories).find({id: catId.toString()});
                var catUser2 = _(user2.sg_categories).find({id: catId.toString()});
                if (!catUser1 | !catUser2) {
                    return;
                }
                var likehoodUser1 = catUser1.likehood;
                var likehoodUser2 = catUser2.likehood;

                return math.pow((likehoodUser1 - likehoodUser2), 2);

            }).forEach(function (val) {

                if (val != undefined) {
                    similarity += val;
                }

            });

            similarity = 1 / (1 + math.sqrt(similarity));

        }


        res.content.body = {
            similarity: similarity,
            user1: {
                id: user1.id,
                name: user1.name,
                lastname: user1.lastname,
                sg_categories: user1.sg_categories
            },
            user2: {
                id: user2.id,
                name: user2.name,
                lastname: user2.lastname,
                sg_categories: user2.sg_categories
            }
        };

        next();

    });

}