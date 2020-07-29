var path = require('path');
var _ = require('lodash');

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

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

    grunt.loadNpmTasks('grunt-npmlink');

    grunt.loadNpmTasks('grunt-elasticsearch');

    // ELASTIC SEARCH MANAGEMENT
    grunt.registerTask('es-init', ['es-delete-indexes', 'es-put-indexes', 'es-put-mappings', 'es-put-data']);

};
