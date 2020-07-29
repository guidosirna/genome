'use strict';

var _ = require('lodash');
var sync = require('synchronize');

module.exports = function (grunt) {

	grunt.registerMultiTask('es-delete-indexes', 'Deletes indexes specified in options', function () {

		var options = this.options() || {};
		var indexes = options.indexes;
		var elasticsearch = require('elasticsearch');
		var done = this.async();
		var log = grunt.log;


		var es = new elasticsearch.Client({ host: options.host });

		sync(es.indices, 'delete');

		sync.fiber(function() {

			try {

				indexes.forEach(function(index) {

					try {

						es.indices.delete({ index: index });
						log.ok('Index ' + index + ' deleted.');

					} catch(e) {
					}

				});

			} catch(e) {
				grunt.log.error(e.message);
				done(false);
			}

			done();

		});

	});

};