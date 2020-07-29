var sync = global.sync;
var await = sync.await;
var defer = sync.defer;
var path = require('path');
var ECT = require('ect');
var _ = require('lodash');
var crop = require('mout/string/crop');
var stripHtmlTags = require('mout/string/stripHtmlTags');
var sentenceCase = require('mout/string/sentenceCase');
var dmix = require('mout/object/deepMixIn');
var merge = require('mout/object/merge');
var moment = require('moment');

module.exports = function (app) {

    app.engine('.ect',
        ECT({
            open: '{{',
            close: '}}',
            watch: true,
            keepSpaces: true,
            root: path.join(__basedir, 'views'),
            ext: '.ect'
        }).render
    );

    app.set('views', path.join(__basedir, 'views'));

    app.locals.crop = crop;
    app.locals.stripHtmlTags = stripHtmlTags;
    app.locals.sentenceCase = sentenceCase;
    app.locals._ = _;
    app.locals.moment = moment;


    app.before(function (req, res, next) {

        res.renderView = function (view, model, callback) {

            res.render(view, model, callback);

        };

        res.renderViewSync = function (view, model) {

            return await(res.renderView(view, model, defer()));

        };

        next();

    });

};