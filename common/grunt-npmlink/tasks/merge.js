'use strict';

module.exports = function (grunt) {

	var path = require('path');

	grunt.registerTask('merge', 'Merges linked modules to the current module', function() {

		var exec = require('child_process').exec,
			_ = require('lodash'),
			done = grunt.task.current.async();

		var linkedDependencies = grunt.config('pkg').linkedDependencies,
			linkedKeys = [];

		for(var key in linkedDependencies) {
			linkedKeys.push(key);
		}

		var command = 'npm unlink ' + linkedKeys.join(' ');

		grunt.log.verbose.writeln(command);

		exec(command, function(err) {

			if(err !== null) {
				grunt.warn('Exec error: ' + err);
			}

			done(!err);

		});

		var copyConfig = {},
			multiTaskName = 'merge-' + (new Date()).getTime();

		copyConfig[multiTaskName] = {
			files: []
		};

		var filesArray = copyConfig[multiTaskName].files;

		for(var key in linkedDependencies) {

			filesArray.push({
				expand: true,
				cwd: linkedDependencies[key],
				src: key + '/**',
				dest: 'node_modules/'
			});

		}

		grunt.config('copy', _.merge(grunt.config('copy'), copyConfig));

		grunt.task.run(['copy:' + multiTaskName]);

	});

};