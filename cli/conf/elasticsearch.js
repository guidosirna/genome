var dmix = require('mout/object/deepMixIn');

global.ES_TYPES = function(type, params, mget) {

    params = params || {};

    var rv = dmix(params, ES_TYPES[type]);

    if (mget) {
        rv._index = rv.index;
        rv._type = rv.type;
        rv._id = rv.id;
        delete rv.index;
        delete rv.type;
        delete rv.id;
    }

    return rv;

};

global.ES_HOST = 'localhost:9200';

var path = require('path'),
	fs = require('fs'),
	_ = require('lodash');

scanMappings(path.join(__basedir, 'deploy/elasticsearch/mappings'));

function scanMappings(p) {

	fs.readdirSync(p).forEach(function (f) {

		var file = path.join(p, f);

		var fileStats = fs.statSync(file);

		if(fileStats.isDirectory()) {

			scanMappings(file);

		} else {

			var mapping = JSON.parse(fs.readFileSync(file, 'utf8'));

			delete mapping.body;

			ES_TYPES[mapping.type] = mapping;

		}

	});

}