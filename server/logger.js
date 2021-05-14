const bunyan = require('bunyan');
const {LoggingBunyan} = require('@google-cloud/logging-bunyan');

// SETUP 

const loggingBunyan = new LoggingBunyan({
    projectId: 'redis-search',
    keyFilename: './loggingServiceAccount.json',
});

const logger = bunyan.createLogger({
    name: 'redis-search-server',
    streams: [
        // Log to the console at 'info' and above
        {stream: process.stdout, level: 'info'},
        // And log to Stackdriver Logging, logging at 'info' and above
        loggingBunyan.stream('info'),
      ],
});

module.exports = logger;