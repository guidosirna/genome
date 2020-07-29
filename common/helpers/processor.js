var await = global.sync.await;
var defer = global.sync.defer;
var defers = global.sync.defers;
var _ = require('lodash');
var util = require('util');
var path = require('path');
var objectUtils = require('mout/object');
var stringUtils = require('mout/string');
var jsUtils = require('mout/lang');
var moment = require('moment');
var fs = require('fs');
var esDslHelper = require('./esdsl-helper');
var fbHelper = require('./facebook');
var synchronizer = require('./synchronizer');
var math = require('mathjs');
var graph = require('fbgraph');

exports.retrieveSubjectAsync = function (id, callback) {

    var esClient = global.esClient;

    esClient.getSource(global.ES_TYPES('raw_subjects', {id: id, ignore: [404]}), function (err, profile) {

        if (profile) {

            if (!profile.last_update_time) {

                profile = null;

            } else {

                var lastUpdateDate = moment(profile.last_update_time);

                if (moment().diff(lastUpdateDate, 'days') > 7) {

                    profile = null;

                }

            }

        }


        if (!profile) {

            fbHelper.getAccessTokenAsync(function (err, token) {

                graph.setAccessToken(token);

                graph.get(id, function (err, resProfile) {

                    graph.get(id + "/likes", {limit: 1000}, function (err, resLikes) {

                        resProfile.likes = resLikes.data;

                        resProfile.last_update_time = moment();

                        esClient.index(global.ES_TYPES('raw_subjects', {body: resProfile}), function (err, data) {

                            callback(err, resProfile);

                        });

                    });

                });

            });

        } else
        {
            callback(err, profile);
        }

    });

};

exports.retrieveSubject = function (id) {

    var esClient = global.esClient;

    var profile = esClient.getSourceSync(global.ES_TYPES('raw_subjects', {id: id, ignore: [404]}));

    if (profile) {

        if (!profile.last_update_time) {

            profile = null;

        } else {

            var lastUpdateDate = moment(profile.last_update_time);

            if (moment().diff(lastUpdateDate, 'days') > 7) {

                profile = null;

            }

        }

    }

    if (!profile) {

        var graph = require('fbgraph');

        synchronizer(graph);

        var resProfile = graph.getSync(id);

        var resLikes = graph.getSync(id + "/likes", {limit: 1000});

        resProfile.likes = resLikes.data;

        resProfile.last_update_time = moment();

        esClient.indexSync(global.ES_TYPES('raw_subjects', {body: resProfile}));

    }

    return resProfile;

};

exports.processSubjectAsync = function (raw_subject, callback) {

    var esClient = global.esClient;

    console.log(raw_subject);

    esClient.search(global.ES_TYPES('sg_categories', esDslHelper().setSize(1000)), function (err, results) {

        var sg_categories_catalog = _(results.hits.hits)
            .map(function (hit) {
                return hit._source;
            });

        esClient.search(global.ES_TYPES('sg_genes', esDslHelper().setSize(1000)), function (err, results) {

            var sg_genes_catalog = _(results.hits.hits)
                .map(function (hit) {
                    return hit._source;
                });


            var subject = {
                id: raw_subject.id,
                name: raw_subject.name,
                first_name: raw_subject.first_name,
                last_name: raw_subject.last_name,
                gender: raw_subject.gender,
                locale: raw_subject.locale,
                sg_categories: [],
                fb_categories: []
            };

            var fb_categories = [];

            var sg_categories = [];

            _(raw_subject.likes).forEach(function (page) {

                page.id = parseInt(page.id);

                fb_categories.push(page.category);

                sg_categories_catalog
                    .filter(function (cat) {
                        return _(cat.fb_categories).contains(page.category);
                    })
                    .forEach(function (cat) {
                        sg_categories.push(cat);
                    });

            });

            subject.fb_categories = _(fb_categories).uniq().value();

            var uniqueCatIds = _(sg_categories).map('id').unique().value();

            _(uniqueCatIds).forEach(function (catId) {

                var cat = _(sg_categories).find({id: catId});

                var qty = _(sg_categories).filter({id: catId}).value().length;

                subject.sg_categories.push({
                    id: cat.id,
                    name: cat.name,
                    likehood: (100 / sg_categories.length * qty / 100)
                })

            });

            var genes = [];

            _(sg_genes_catalog).forEach(function (gene) {

                var similarity = exports.getEuclideanDistance(subject.sg_categories, gene.sg_categories);

                genes.push({
                    id: gene.id,
                    name: gene.name,
                    type: gene.type,
                    likehood: similarity
                });

            });

            subject.sg_genes = genes;

            if (genes.length > 0) {

                subject.main_gene = _(genes).sortBy(function (gene) {
                    return gene.likehood * -1;
                }).first();

            }

            esClient.index(global.ES_TYPES('subjects', {body: subject}), function (err, results) {

                console.log('indexed', subject);

                callback(err, results);

            });

        });

    });

};

exports.processSubject = function (raw_subject, sg_categories_catalog, sg_genes_catalog) {

    var esClient = global.esClient;

    var log = global.log;

    if (!sg_categories_catalog) {

        sg_categories_catalog = _(esClient.searchSync(global.ES_TYPES('sg_categories', esDslHelper().setSize(1000))).hits.hits)
            .map(function (hit) {
                return hit._source;
            });

    }

    if (!sg_genes_catalog) {

        sg_genes_catalog = _(esClient.searchSync(global.ES_TYPES('sg_genes', esDslHelper().setSize(1000))).hits.hits)
            .map(function (hit) {
                return hit._source;
            });

    }

    if (raw_subject.first_name) {

        var subject = {
            id: raw_subject.id,
            name: raw_subject.name,
            first_name: raw_subject.first_name,
            last_name: raw_subject.last_name,
            gender: raw_subject.gender,
            locale: raw_subject.locale,
            sg_categories: [],
            fb_categories: []
        };

        var fb_categories = [];

        var sg_categories = [];

        _(raw_subject.likes).forEach(function (page) {

            page.id = parseInt(page.id);

            fb_categories.push(page.category);

            sg_categories_catalog
                .filter(function (cat) {
                    return _(cat.fb_categories).contains(page.category);
                })
                .forEach(function (cat) {
                    sg_categories.push(cat);
                });

        });

        subject.fb_categories = _(fb_categories).uniq().value();

        var uniqueCatIds = _(sg_categories).map('id').unique().value();

        _(uniqueCatIds).forEach(function (catId) {

            var cat = _(sg_categories).find({id: catId});

            var qty = _(sg_categories).filter({id: catId}).value().length;

            subject.sg_categories.push({
                id: cat.id,
                name: cat.name,
                likehood: (100 / sg_categories.length * qty / 100)
            })

        });

        var genes = [];

        _(sg_genes_catalog).forEach(function (gene) {

            var similarity = exports.getEuclideanDistance(subject.sg_categories, gene.sg_categories);

            genes.push({
                id: gene.id,
                name: gene.name,
                type: gene.type,
                likehood: similarity
            });

        });

        subject.sg_genes = genes;

        if (genes.length > 0) {

            subject.main_gene = _(genes).sortBy(function (gene) {
                return gene.likehood * -1;
            }).first();

        }

        esClient.indexSync(global.ES_TYPES('subjects', {body: subject}));

    }

};

exports.getEuclideanDistance = function (set1, set2) {

    var matchedSet = [];

    _(set1).forEach(function (cat) {
        if (!_(matchedSet).contains(cat.id) && _(set2).find({id: cat.id})) {
            matchedSet.push(cat.id);
        }
    });

//    _(set2).forEach(function (cat) {
//        if (!_(matchedSet).contains(cat.id) && _(set1).find({id: cat.id})) {
//            matchedSet.push(cat.id);
//        }
//    });

    var similarity = 0;

    if (matchedSet.length > 0) {

        _(matchedSet).map(function (catId) {

            var catSet1 = _(set1).find({id: catId});
            var catSet2 = _(set2).find({id: catId});

            var likehoodSet1 = catSet1.likehood;
            var likehoodSet2 = catSet2.likehood;

            return math.pow((likehoodSet1 - likehoodSet2), 2);

        }).forEach(function (val) {

            if (val != undefined) {
                similarity += val;
            }

        });

        similarity = 1 / (1 + math.sqrt(similarity));

    }

    return similarity;

};