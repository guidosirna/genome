'use strict';

module.exports = function (grunt) {
    grunt.initConfig({

        'es-put-mappings': {
            main: {
                options: {
                    host: 'localhost:9200',
                    mappings: [
                        {
                            index: 'h2o',
                            type: 'users',
                            body: {
                                users: {
                                    dynamic: false,
                                    _id: { path: 'username' },
                                    properties: {
                                        username: { type: 'string', index: 'not_analyzed' },
                                        name: { type: 'string' },
                                        email: { type: 'string', index: 'not_analyzed' }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },

        'es-delete-indexes': {
            main: {
                options: {
                    indexes: ['h2o']
                }
            }
        }

    });

    grunt.loadTasks('tasks');

};
