var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

global.LOGGER_SETTINGS = {
    name: 'sg-cli',
    streams: [
        {
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut
        }
    ]
};