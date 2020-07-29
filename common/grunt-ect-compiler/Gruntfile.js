'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    ectcompiler: {

      test: {
        options: {
          ext: '.ect',
          root: 'tests/ect'
        },
        cwd: 'tests/ect',
        src:  ['**/page_*.ect'],
        dest: 'tests/compiled/'
      }
    }
  });

  grunt.task.registerTask('default', 'ectcompiler');
  grunt.loadTasks('tasks');

};
