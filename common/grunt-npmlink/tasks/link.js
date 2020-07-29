'use strict';

module.exports = function (grunt) {

	var path = require('path');

	grunt.registerTask('link', 'Links specified modules to the current module', function() {

		var exec = require('child_process').exec,
			done = grunt.task.current.async(),
			_ = require('lodash');

		var linkedDependencies = _.merge(grunt.config('pkg').linkedDependencies, grunt.config('pkg').linkedDevDependencies),
			linkedKeys = [];

		for(var key in linkedDependencies) {
			linkedKeys.push(linkedDependencies[key] + key);
		}

		var command = 'npm link ' + linkedKeys.join(' ');

		grunt.log.verbose.writeln(command);

		exec(command, { cwd: process.cwd() }, function(err) {

			if(err !== null) {
				grunt.warn('Exec error: ' + err);
			}

			done(!err);

		});



	});

};