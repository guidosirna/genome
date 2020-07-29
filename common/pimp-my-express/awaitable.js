// TODO: Move from pimp-my-express...

module.exports = function awaitable(await, defer, fn) {

	return function awaitableWrapper(req, res, next) {

		await(fn(req, res, defer()));

		next();

	}

};