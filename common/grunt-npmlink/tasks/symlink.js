'use strict';

module.exports = function (grunt) {

    var path = require('path');
    var fs = require('fs');

    grunt.registerTask('symlink', 'Generates the specified symlinks', function () {

        var done = grunt.task.current.async(),
            _ = require('lodash');

        var linkedReferences = grunt.config('pkg').linkedReferences;

        for (var key in linkedReferences) {

            var ref = linkedReferences[key];

            grunt.log.verbose.writeln('Linked "%s" => "%s"', ref.dst, ref.src);

            if (fs.existsSync(ref.dst)) {

                fs.unlinkSync(ref.dst);

            }

            fs.symlinkSync(ref.src, ref.dst, 'dir');

        }

        done(true);

    });

};