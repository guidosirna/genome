var await = global.sync.await;
var defer = global.sync.defer;

module.exports = function awaitable(fn) {

	return function awaitableWrapper(req, res, next) {

		await(fn(req, res, defer()));

		next();

	}

};