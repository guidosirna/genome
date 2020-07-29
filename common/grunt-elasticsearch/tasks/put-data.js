'use strict';

var _ = require('lodash');
var sync = require('synchronize');
var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');

module.exports = function (grunt) {

    grunt.registerMultiTask('es-put-data', 'Uploads data bulk as specified in options', function () {

        var files = this.files;
        var options = this.options() || {};
        var dataSet = options.mappings || [];
        var elasticsearch = require('elasticsearch');
        var log = grunt.log;
        var done = this.async();
        var clear = grunt.option('clear') ? grunt.option('clear') : false;
        var filter = grunt.option('filter') ? grunt.option('filter').split(',') : ['.*'];
        var filterRegexs = _(filter).map(function (f) {
            return new RegExp(f);
        }).value();

        var es = new elasticsearch.Client({ host: options.host });

        sync(es, 'index', 'bulk', 'deleteByQuery');

        sync(es.indices, 'exists', 'create');

        sync.fiber(function () {

            try {

                var dataFiles = [];

                files.forEach(function (fileGroup) {

                    var cwd = fileGroup.cwd;

                    fileGroup.src.forEach(function (file) {

                        var basename = path.basename(file);

                        var matchFilter = _(filterRegexs).any(function (re) {
                            return re.test(basename);
                        });

                        if (!matchFilter) {
                            return;
                        }

                        var ext = path.extname(file);

                        if (ext == '.json') {
                            dataSet.push(grunt.file.readJSON(path.join(cwd, file)));
                        } else if (ext == '.zip') {

                            var zip = new AdmZip(path.join(cwd, file));
                            var zipEntries = zip.getEntries();

                            zipEntries.forEach(function (zipEntry) {

                                var filename = path.join(cwd, zipEntry.entryName);

                                zip.extractEntryTo(zipEntry.entryName, cwd, false, true);

                                dataSet.push(grunt.file.readJSON(filename));

                                fs.unlinkSync(filename);

                            });

                        }

                    });

                });


                dataSet.forEach(function (data) {

                    var bulkActios = [];

                    var i = 0;

                    if (clear) {

                        log.ok('Clearing ' + data.index + ' > ' + data.type + '.');

                        es.deleteByQuery({ index: data.index, type: data.type, body: {query: { match_all: {} }} });

                    }

                    for (; i < data.records.length; i++) {

                        if (i % 1000 == 0 && bulkActios.length > 0) {

                            var br = es.bulk({ body: bulkActios });

                            if (br.errors) {
                                log.error('error');
                                //fs.appendFileSync('c:/temp/bulk.txt', JSON.stringify(br, null, 4));
                            }

                            bulkActios = [];

                            log.ok('Imported ' + i + ' records for type: ' + data.type + '.');

                        }

                        var record = data.records[i];

                        var bulkItem = { index: { _index: data.index, _type: data.type } };

                        if (record._parent) {
                            bulkItem.index._parent = record._parent;
                            delete record._parent;
                        }

                        bulkActios.push(bulkItem);
                        bulkActios.push(record);

                    }

                    if (bulkActios.length > 0) {

                        var br = es.bulk({ body: bulkActios });

                        if (br.errors) {
                            log.ok('BR');
                            fs.appendFileSync('c:/temp/bulk.txt', JSON.stringify(br, null, 4));
                        }

                        log.ok('Imported ' + i + ' records for type: ' + data.type + '.');

                    }

                    log.ok('Data imported for type: ' + data.type + '.');

                });

            } catch (e) {
                grunt.log.error(e.message);
                done(false);
            }

            done();

        });

    });

    grunt.registerMultiTask('es-put-data-single', 'Uploads data single as specified in options', function () {

        var files = this.files;
        var options = this.options() || {};
        var dataSet = options.mappings || [];
        var elasticsearch = require('elasticsearch');
        var log = grunt.log;
        var done = this.async();
        var clear = grunt.option('clear') ? grunt.option('clear') : false;
        var filter = grunt.option('filter') ? grunt.option('filter').split(',') : ['.*'];
        var filterRegexs = _(filter).map(function (f) {
            return new RegExp(f);
        }).value();

        var es = new elasticsearch.Client({ host: options.host });

        sync(es, 'index', 'bulk', 'deleteByQuery');

        sync(es.indices, 'exists', 'create');

        sync.fiber(function () {

            try {

                var dataFiles = [];

                files.forEach(function (fileGroup) {

                    var cwd = fileGroup.cwd;

                    fileGroup.src.forEach(function (file) {

                        var basename = path.basename(file);

                        var matchFilter = _(filterRegexs).any(function (re) {
                            return re.test(basename);
                        });

                        if (!matchFilter) {
                            return;
                        }

                        var ext = path.extname(file);

                        if (ext == '.json') {
                            dataSet.push(grunt.file.readJSON(path.join(cwd, file)));
                        } else if (ext == '.zip') {

                            var zip = new AdmZip(path.join(cwd, file));
                            var zipEntries = zip.getEntries();

                            zipEntries.forEach(function (zipEntry) {

                                var filename = path.join(cwd, zipEntry.entryName);

                                zip.extractEntryTo(zipEntry.entryName, cwd, false, true);

                                dataSet.push(grunt.file.readJSON(filename));

                                fs.unlinkSync(filename);

                            });

                        }

                    });

                });


                dataSet.forEach(function (data) {

                    var bulkActios = [];

                    var i = 0;

                    if (clear) {

                        log.ok('Clearing ' + data.index + ' > ' + data.type + '.');

                        es.deleteByQuery({ index: data.index, type: data.type, body: {query: { match_all: {} }} });

                    }

                    log.ok(data.records.length + ' records');

                    var idx = 1;

                    var ids = [];

                    _(data.records).forEach(function(record){

                        if(_(ids).contains(record.id)){
                            return;
                        }

                        var r = {
                            index: data.index,
                            type: data.type,
                            id: record.id,
                            body: record
                        };

                        es.index(r);

                        ids.push(record.id);

                        log.ok('Importing %s of %s, %s', idx, data.records.length, record.id);

                        idx++;

                    });

                    log.ok('Data imported for type: ' + data.type + '.');

                });

            } catch (e) {
                grunt.log.error(e.message);
                done(false);
            }

            done();

        });

    });

};