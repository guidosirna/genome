'use strict';

var _ = require('lodash');
var sync = require('synchronize');
var path = require('path');

module.exports = function (grunt) {

	grunt.registerMultiTask('es-put-indexes', 'Uploads settings as specified in options', function () {

		var files = this.files;
		var options = this.options() || {};
		var indexesSettings = options.indexesSettings || [];
		var elasticsearch = require('elasticsearch');
		var log = grunt.log;
		var done = this.async();

		var es = new elasticsearch.Client({ host: options.host });

		sync(es.indices, 'exists', 'create', 'putSettings', 'close', 'open');

		sync.fiber(function () {

			try {

				files.forEach(function(fileGroup) {

					var cwd = fileGroup.cwd;

					fileGroup.src.forEach(function(file) {

						indexesSettings.push(grunt.file.readJSON(path.join(cwd, file)));

					});

				});

				try {
					es.indices.close({ index: '_all' });
				} catch(e) {}

				indexesSettings.forEach(function (indexSettings) {

					var indexes = _(indexSettings.index).toArray();

					indexes.forEach(function(index) {

						if (!es.indices.exists({ index: index })) {

							log.writeln('Index ' + index + ' does not exists... Creating it now.');

							es.indices.create({
								index: index,
								body: indexSettings.body
							});

							log.ok('Index ' + index + ' created.');

						} else {

							es.indices.putSettings({
								index: index,
								body: indexSettings.body
							});

							log.ok('Updated index: ' + index + '.');

						}

					});

				});

				try {
					es.indices.open({ index: '_all' });
				} catch(e) {}

			} catch (e) {
				grunt.log.error(e.message);
				done(false);
			}

			done();

		});

	});

};