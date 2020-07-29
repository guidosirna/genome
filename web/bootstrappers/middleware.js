var express = require('express');
var domain = require('helpers/domain-handler');

module.exports = function(app) {

	app.use(domain);
	//app.use(express.compress());
	app.configure('development', function() { app.use(express.static(__basedir)); });
	app.use(express.cookieParser());
	app.use(express.logger('short'));
	app.use(express.methodOverride());
	app.use(app.router);
    app.enable('trust proxy');

};