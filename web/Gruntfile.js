var path = require('path');
var _ = require('lodash');

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        baseUrl: grunt.option('base-url') || 'localhost:3100',

        clean: {
            main: ['tmp', 'views', 'js', 'css']
        },

        less: {
            main: {
                options: {
                    compile: true
                },
                files: [
                    { 'tmp/index-less-compiled.css': 'less/index.less' }

                ]
            }
        },

        concat: {
            css: {
                files: [
                    {
                        'css/index.css': [
                            'tmp/index-less-compiled.css',
                            'styles/nv.d3.min.css'
                        ]
                    }
                ]
            },
            js: {
                files: [
                    {
                        'js/vendor.js': [
                            'node_modules/ect/lib/ect.js',
                            'scripts/lib/jquery-1.11.0.js',
                            'scripts/lib/jquery-extensions.js',
                            'node_modules/bootstrap/js/modal.js',
                            'node_modules/bootstrap/js/dropdown.js',
                            'node_modules/bootstrap/js/tooltip.js',
                            'node_modules/bootstrap/js/popover.js'
                        ]
                    }
                ]
            }
        },

        cssmin: {
            main: {
                options: {
                    keepSpecialComments: 0
                },
                files: {
                    'css/index.css': 'css/index.css'
                }
            }
        },

        browserify: {
            main: {
                options: {
                    debug: true
                },
                files: {
                    'js/index.js': 'scripts/site/index/main.js',
                    'js/me.js': 'scripts/site/me/main.js'
                }
            }
        },

        copy: {
            css: {
                files: [
                    { 'css/nv.d3.min.css': 'styles/nv.d3.min.css' }
                ]
            },
            js: {
                files: [
                    { 'js/yepnope.js': 'scripts/lib/yepnope.js' },
                    { 'js/nv.d3.min.js': 'scripts/lib/nv.d3.min.js' },
                    { 'js/d3.v3.js': 'scripts/lib/d3.v3.js' }
                ]
            },
            templates: {
                files: [
                    { expand: true, cwd: 'templates/', src: '**/*.ect', dest: 'views/' }
                ]
            }
        },

        uglify: {
            options: {
                report: 'min'
            },
            main: {
                files: {
                    'js/index.js': 'js/index.js',
                    'js/me.js': 'js/me.js',
                    'js/yepnope.js': 'js/yepnope.js'
                }
            }
        },

        watch: {
            less: {
                files: ['less/**/*.*', 'node_modules/bootstrap/less/*.*'],
                tasks: ['less', 'concat:css']
            },
            scripts: {
                files: ['scripts/**/*.*'],
                tasks: ['copy:js', 'browserify']
            },
            stylesheets: {
                files: ['stylesheets/**/*.*'],
                tasks: ['less', 'concat:css']
            },
            templates: {
                files: ['templates/**/*.*'],
                tasks: ['copy:templates', 'ectcompiler'],
                options: {
                    spawn: false
                }
            }
        },

        replace: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'templates/',
                        src: '**/*.ect',
                        dest: 'views/'
                    },
                    {
                        'css/site.css': 'css/site.css'
                    }
                ],
                options: { // TODO: Improve replacement patterns
                    force: true,
                    patterns: [
                        {
                            match: /<%=\s*@_(.*?)\s*%>/g,
                            replacement: '$1'
                        },
                        {
                            match: 'timestamp',
                            replacement: '<%= new Date().getTime() %>'
                        },
                        {
                            match: /src=\s*("|')\s*\/js/g,
                            replacement: 'src=$1//<%= baseUrl %>/js'
                        },
                        {
                            match: /src=\s*("|')\s*\/images/g,
                            replacement: 'src=$1//<%= baseUrl %>/images'
                        },
                        {
                            match: /href=\s*("|')\s*\/css/g,
                            replacement: 'href=$1//<%= baseUrl %>/css'
                        },
                        {
                            match: /url\(\s*("|'){0,1}\s*\/images/g,
                            replacement: 'url($1//<%= baseUrl %>/images'
                        },
                        {
                            match: /url\(\s*("|'){0,1}\s*\.\.\/fonts/g,
                            replacement: 'url($1//<%= baseUrl %>/fonts'
                        }
                    ]
                }
            }
        },

        ectcompiler: {
            main: {
                options: {
                    open: '{{',
                    close: '}}',
                    ECTPath: '../../ect',
                    prepend: 'module.exports = ',
                    keepSpaces: false
                },
                cwd: 'views/partials',
                src: ['**/*.ect'],
                dest: 'views/compiled/'
            }
        },

        'es-put-mappings': {
            main: {
                options: {
                    host: 'localhost:9200'
                },
                files: [
                    {
                        cwd: 'deploy/elasticsearch/mappings',
                        src: ['**/*.json']
                    }
                ]
            }
        },

        'es-put-indexes': {
            main: {
                options: {
                    host: 'localhost:9200'
                },
                files: [
                    {
                        cwd: 'deploy/elasticsearch/index-settings',
                        src: ['**/*.json']
                    }
                ]
            }
        },

        'es-put-data': {
            main: {
                options: {
                    host: 'localhost:9200'
                },
                files: [
                    {
                        cwd: 'deploy/elasticsearch/data',
                        src: ['**/*.json','**/*.zip']
                    }
                ]
            }
        },

        'es-put-data-single': {
            main: {
                options: {
                    host: 'localhost:9200'
                },
                files: [
                    {
                        cwd: 'deploy/elasticsearch/data',
                        src: ['**/*.json','**/*.zip']
                    }
                ]
            }
        },

        'es-delete-indexes': {
            main: {
                options: {
                    indexes: ['sg']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-ect-compiler');
    grunt.loadNpmTasks('grunt-npmlink');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-elasticsearch');

    // ELASTIC SEARCH MANAGEMENT
    grunt.registerTask('es-init', ['es-delete-indexes', 'es-put-indexes', 'es-put-mappings', 'es-put-data']);

    // DEBUG
    grunt.registerTask('default', ['clean', 'copy', 'less', 'concat', 'ectcompiler', 'browserify']);

};
