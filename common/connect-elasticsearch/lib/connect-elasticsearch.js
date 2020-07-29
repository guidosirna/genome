/**
 * One day in seconds.
 */

var oneDay = 86400;

/**
 * Return the `ElasticSearchStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function (connect) {

    /**
     * Connect's Store.
     */

    var Store = connect.session.Store;

    /**
     * Initialize ElasticSearchStore with the given `options`.
     *
     * @param {Object} options
     * @api public
     */

    function ElasticSearchStore(options) {

        var self = this;

        self.options = options || {};

        Store.call(this, options);

    }

    /**
     * Inherit from `Store`.
     */

    ElasticSearchStore.prototype.__proto__ = Store.prototype;

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {String} sid
     * @param {Function} fn
     * @api public
     */

    ElasticSearchStore.prototype.get = function (sid, fn) {

        var self = this;

        self.options.client.get(
            {
                index: self.options.index,
                type: self.options.type,
                id: sid,
                ignore: [404]
            },
            function(err, data, response) {

                if (err) return fn(err);
                if (response == 404) return fn();

                return fn(null, data._source);

            }
        );

    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */

    ElasticSearchStore.prototype.set = function (sid, sess, fn) {

        var self = this;

        // TODO: Check cookie maxAge Impl...
        var ttl = self.options.ttl || '1d';

        self.options.client.index(
            {
                index: self.options.index,
                type: self.options.type,
                id: sid,
                ignore: [404],
                ttl: ttl,
                body: sess
            },
            function(err, data) {

                fn && fn.apply(this, arguments);

            }
        );

    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @api public
     */

    ElasticSearchStore.prototype.destroy = function (sid, fn) {

        var self = this;

        self.options.client.delete(
            {
                index: self.options.index,
                type: self.options.type,
                id: sid
            },
            function(err, data) {

                fn && fn.apply(this, arguments);

            }
        );

    };

    return ElasticSearchStore;

};