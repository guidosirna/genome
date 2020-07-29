global.__basedir = __dirname;
global.sync = require('synchronize');

var program = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('lodash');


// configs
require('./conf/logger');
require('./conf/elasticsearch');
require('./conf/facebook');


// bootstrappers
require('./bootstrappers/logger');
require('./bootstrappers/utils');
require('./bootstrappers/elasticsearch');


// libs
var FacebookLib = require('./lib/facebook');


program
    .version('0.1')
    .description('Shopear Genome CLI');

program
    .command('process')
    .option('-o, --operation [operation]', 'Operation to be executed')
    .action(function (options) {
        var lib = new FacebookLib();
        if (options.operation == 'retrieve-subjects') {
            lib.retrieveSubjects();
        }
        if (options.operation == 'retrieve-genes') {
            lib.retrieveGenes();
        }
        if (options.operation == 'process-subjects') {
            lib.processSubjects();
        }
        if (options.operation == 'process-genes') {
            lib.processGenes();
        }
        if (options.operation == 'all') {
            lib.retrieveSubjects({exit: false});
            lib.processRawData();
        }
    });

/////////////////////////
program.parse(process.argv);