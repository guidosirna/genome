'use strict';

var _ = require('lodash');
var sync = require('synchronize');
var path = require('path');

module.exports = function (grunt) {

    grunt.registerMultiTask('es-put-mappings', 'Uploads mappings as specified in options', function () {

        var files = this.files;
        var options = this.options() || {};
        var mappings = options.mappings || [];
        var elasticsearch = require('elasticsearch');
        var log = grunt.log;
        var done = this.async();
        var filter = grunt.option('filter') ? grunt.option('filter').split(',') : ['.*'];
        var filterRegexs = _(filter).map(function (f) {
            return new RegExp(f);
        }).value();


        var es = new elasticsearch.Client({ host: options.host });

        sync(es.indices, 'exists', 'create', 'putMapping');

        sync.fiber(function () {

            try {

                files.forEach(function (fileGroup) {

                    var cwd = fileGroup.cwd;

                    fileGroup.src.forEach(function (file) {

                        var basename = path.basename(file);

                        var matchFilter = _(filterRegexs).any(function (re) {
                            return re.test(basename);
                        });

                        if (matchFilter) {
                            mappings.push(grunt.file.readJSON(path.join(cwd, file)));
                        }


                    });

                });

                mappings.forEach(function (mapping) {

                    if (!es.indices.exists({ index: mapping.index })) {
                        log.writeln('Index ' + mapping.index + ' does not exists... Creating it now.')
                        es.indices.create({ index: mapping.index });
                        log.ok('Index ' + mapping.index + ' created.')
                    }

                    es.indices.putMapping(
                        {
                            index: mapping.index,
                            type: mapping.type,
                            ignoreConflicts: true,
                            body: mapping.body
                        }
                    );

                    log.ok('Created mapping: ' + mapping.type + '.');

                });

            } catch (e) {
                grunt.log.error(e.message);
                done(false);
            }

            done();

        });

    });

};