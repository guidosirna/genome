'use strict';

module.exports = function (grunt) {

	grunt.registerMultiTask('ectcompiler', 'Generates an compiled template file from an ect templates', function () {

		var options = this.options() || {};

		var path = require('path');
		var ECT = options.ECTPath ? require(options.ECTPath) : require('ect');

		var data = this.data,
			cwd = data.cwd,
			src = data.src,
			dest = data.dest,
			ect = ECT(options || {}),
			done = this.async();

		function compile(files, cwd) {

			var status = true;

			for (var key in files) {
				
				var file = files[key];

				var src = path.resolve(cwd, file);

				var dst = path.resolve(dest, path.dirname(file), path.basename(file, path.extname(file)) + (options.ext || '.js'));

				var contents = ect.compile(grunt.file.read(src));

				if(typeof options.prepend === 'string') {
					contents = options.prepend + contents;
				}

				if(typeof options.append === 'string') {
					contents = contents + options.append;
				}

				grunt.file.write(dst, contents);

				status = (status && grunt.file.exists(dst));

				if (status) {

					grunt.log.ok(src + ' was compiled to ' + dst);

				} else {

					grunt.fail.warn('Something went wrong when `' + src + '` was compiled to `' + dst + '`');

				}

			}

			return status;

		}

		function getFilesList(src, cwd) {

			if (!src) return false;

			var files = [];
			var options = {};
			options.cwd = cwd;

			if (typeof src === 'string') {
				src = [src];
			}

			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					var pattern = src[key];
					files = files.concat(grunt.file.expand(options, pattern));
				}
			}

			return files;

		}

		(function init() {

			var status;

			var files = getFilesList(src, cwd);

			try {
				status = compile(files, cwd);
			} catch (e) {
				grunt.log.error(e);
			}

			done(status);

		}).bind(this)();

		return this.init;

	});

};