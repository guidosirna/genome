var _ = require('lodash');
var objectUtils = require('mout/object');
var jsUtils = require('mout/lang');

function esDslHelper(q) {
    if (q) {
        objectUtils.deepMixIn(this, q);
    }
    return this;
}

esDslHelper.prototype.setFrom = function (n) {
    var self = this;
    self.ensureBody();
    self.body.from = n;
    return self;
}
esDslHelper.prototype.setSize = function (n) {
    var self = this;
    self.ensureBody();
    self.body.size = n;
    return self;
}
esDslHelper.prototype.addQueryBoolMust = function (q, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    self.ensureQueryBoolMust();
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    self.body.query.bool.must.push(q);
    return self;
}
esDslHelper.prototype.addQueryBoolMustTerm = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermFilter(name, value, nestedProp);
    return self.addQueryBoolMust(term, removeMatchAll);
}
esDslHelper.prototype.addQueryBoolMustTerms = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermsFilter(name, value, nestedProp);
    return self.addQueryBoolMust(term, removeMatchAll);
}
esDslHelper.prototype.addQueryBoolMustNot = function (q, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    self.ensureQueryBoolMustNot();
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    self.body.query.bool.must_not.push(q);
    return self;
}
esDslHelper.prototype.addQueryBoolMustNotTerm = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermFilter(name, value, nestedProp);
    return self.addQueryBoolMustNot(term, removeMatchAll);
}
esDslHelper.prototype.addQueryBoolMustNotTerms = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermsFilter(name, value, nestedProp);
    return self.addQueryBoolMustNot(term, removeMatchAll);
}
esDslHelper.prototype.addQueryBoolShould = function (q, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    self.ensureQueryBoolShould();
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    self.body.query.bool.should.push(q);
    return self;
}
esDslHelper.prototype.addQueryBoolShouldTerm = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermFilter(name, value, nestedProp);
    return self.addQueryBoolShould(term, removeMatchAll);
}
esDslHelper.prototype.addQueryBoolShouldTerms = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    var term = self.getTermsFilter(name, value, nestedProp);
    return self.addQueryBoolShould(term, removeMatchAll);
}
esDslHelper.prototype.addQueryTerm = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    self.ensureQuery();
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    var term = self.getTermFilter(name, value, nestedProp);
    self.body.query = term;
    return self;
}
esDslHelper.prototype.addQueryTerms = function (name, value, nestedProp, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    nestedProp = nestedProp == undefined ? true : nestedProp;
    self.ensureQuery();
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    self.body.query.terms = {};
    if (nestedProp) {
        objectUtils.set(self.body.query, 'terms.' + name, value);
    } else {
        self.body.query.terms[name] = value;
    }
    return self;
}
esDslHelper.prototype.set = function (name, value, removeMatchAll) {
    var self = this;
    removeMatchAll = removeMatchAll || true;
    if (removeMatchAll) {
        self.removeMatchAll();
    }
    if (objectUtils.has(self, name)) {
        var v = objectUtils.get(self, name);
        if (jsUtils.isArray(v)) {
            v.push(value);
        } else {
            objectUtils.set(self, name, value);
        }
    } else {
        objectUtils.set(self, name, value);
    }
    return self;
}
esDslHelper.prototype.addMatchAll = function () {
    var self = this;
    self.set('body.query.match_all', {}, false);
    return self;
}
esDslHelper.prototype.setFields = function (value) {
    var self = this;
    self.ensureBody();
    objectUtils.set(self, 'fields', value);
    return self;
}
esDslHelper.prototype.setSource = function (value) {
    var self = this;
    self.ensureBody();
    objectUtils.set(self, '_source', value);
    return self;
}
esDslHelper.prototype.setScriptFields = function (value) {
    var self = this;
    self.ensureBody();
    objectUtils.set(self, 'script_fields', value);
    return self;
}
esDslHelper.prototype.setSort = function (name, direction) {
    var self = this;
    var sortObj = {};

    if (name.indexOf('.') != -1) {
        sortObj[name] = {order: direction};
    } else {
        objectUtils.set(sortObj, name, {order: direction});
    }

    self.set('body.sort', [], false);
    self.body.sort.push(sortObj);
    return self;
}
esDslHelper.prototype.setSortFromQueryString = function (req) {
    var self = this;
    if (req.query.sort) {
        var sortOptions = JSON.parse(req.query.sort);
        _(sortOptions).forEach(function (sort) {
            self.setSort(sort.property, sort.direction.toLowerCase());
        });
    }
    return self;
}
esDslHelper.prototype.getTermFilter = function (name, value, nestedProp) {
    var self = this;
    var rv = {term: {}};
    nestedProp = nestedProp == undefined ? true : nestedProp;
    if (nestedProp) {
        objectUtils.set(rv, 'term.' + name + '.value', value);
    } else {
        rv.term[name] = {value: value};
    }
    return rv;
}
esDslHelper.prototype.getTermsFilter = function (name, value, nestedProp) {
    var self = this;
    var rv = {terms: {}};
    nestedProp = nestedProp == undefined ? true : nestedProp;
    if (nestedProp) {
        objectUtils.set(rv, 'terms.' + name, value);
    } else {
        rv.terms[name] = value;
    }
    return rv;
}
esDslHelper.prototype.ensureProp = function (path, default_value) {
    var self = this;
    default_value = default_value || {};
    if (!objectUtils.has(self, path)) {
        objectUtils.set(self, path, default_value);
    }
}
esDslHelper.prototype.ensureBody = function () {
    var self = this;
    self.ensureProp('body');
}
esDslHelper.prototype.ensureQuery = function () {
    var self = this;
    self.ensureProp('body.query', {});
}
esDslHelper.prototype.ensureQueryBool = function () {
    var self = this;
    self.ensureProp('body.query.bool');
}
esDslHelper.prototype.ensureQueryBoolMust = function () {
    var self = this;
    self.ensureProp('body.query.bool.must', []);
}
esDslHelper.prototype.ensureQueryBoolMustNot = function () {
    var self = this;
    self.ensureProp('body.query.bool.must_not', []);
}
esDslHelper.prototype.ensureQueryBoolShould = function () {
    var self = this;
    self.ensureProp('body.query.bool.should', []);
}
esDslHelper.prototype.removeMatchAll = function () {
    var self = this;
    if (objectUtils.has(self, 'body.query.match_all')) {
        delete self.body.query.match_all;
    }
}


module.exports = function (q) {
    return new esDslHelper(q);
}
