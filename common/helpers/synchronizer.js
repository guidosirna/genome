var arrayUtils = require('mout/array');
var stringUtils = require('mout/string');
var objectUtils = require('mout/object');
var sync = global.sync;

module.exports = function synchronizer(obj) {

    synchronizeMethods(obj);

};

function synchronizeMethods(obj) {

    if (!obj) {
        return;
    }
    if (obj.__synchronized) {
        return;
    }
    obj.__synchronized = true;

    objectUtils.forIn(obj, function (property, name) {
        if (typeof property == 'function' && !stringUtils.endsWith(name, 'Sync')) {
            obj.__proto__[name + 'Sync'] = sync.syncFn(obj[name]);
        }
    });

    objectUtils.forOwn(obj, function (property, name) {
        if (typeof property == 'function' && !stringUtils.endsWith(name, 'Sync')) {
            obj[name + 'Sync'] = sync.syncFn(obj[name]);
        }
    });

};

