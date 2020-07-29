var bunyan = require('bunyan');

global.log = bunyan.createLogger(global.LOGGER_SETTINGS);
