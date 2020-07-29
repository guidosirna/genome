// configs
global.__basedir = __dirname;

require('./conf/general');
require('./conf/logger');
require('./conf/elasticsearch');
require('./conf/facebook');

global.sync = require('synchronize');

var path = require('path');
var express = require('express');
var app = require('pimp-my-express')(express());
var http = require('http');

app.$ = {};

require('./bootstrappers/utils')(app);
require('./bootstrappers/view-engine')(app);
require('./bootstrappers/middleware')(app);
require('./bootstrappers/elasticsearch')(app);
require('./bootstrappers/logger')(app);
require('./bootstrappers/auth')(app);
require('./bootstrappers/fibers')(app); // Make sure this is the last middleware!!!


app.scanRoutes(path.join(__basedir, 'routes'));

app.pimpIt();

app.set('port', process.env.PORT || 3100);

http.createServer(app).listen(app.get('port'), function () {
    global.logger.info('Shopear Genome Web Node listening on port ' + app.get('port'));
});