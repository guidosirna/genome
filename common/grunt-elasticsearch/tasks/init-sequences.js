'use strict';

var _ = require('lodash');
var sync = require('synchronize');
var fs = require('fs');
var path = require('path');
var elasticsearch = require('elasticsearch');

module.exports = function (grunt) {

    grunt.registerMultiTask('es-init-sequences', 'Initializes the sequences to the initial value', function () {

        var options = this.options() || {};
        var log = grunt.log;
        var done = this.async();

        var es = new elasticsearch.Client({ host: options.host });

        sync(es, 'index', 'bulk', 'search');

        sync(es.indices, 'exists', 'create');

        sync.fiber(function () {

            try {

                options.types.forEach(function (type) {
                    var q = {
                        index: options.indexes.data,
                        type: type,
                        body: {
                            size: 1,
                            sort: {
                                _script: {
                                    script: "_source.id",
                                    type: "number",
                                    order: "desc"
                                }
                            }
                        }
                    };

                    var results = es.search(q).hits.hits;

                    var max = 1;

                    if (results.length > 0) {
                        max = parseInt(results[0]._id);
                    }
                    var thHi = (Math.ceil(max / 1000)) + 1;

                    for (var i = 0; i <= thHi; i++) {
                        es.index({
                            index: options.indexes.sequence,
                            type: 'sequences',
                            id: type,
                            body: {}
                        })
                    }

                });

            } catch (e) {
                grunt.log.error(e.message);
                done(false);
            }

            done();

        });

    });

};