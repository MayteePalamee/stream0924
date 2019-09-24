var log4js = require('log4js');
log4js.configure({
    appenders: { 'file': { type: 'file', filename: 'logs/logger.log' } },
    categories: { default: { appenders: ['file'], level: 'debug' }}
});
var logger = log4js.getLogger('file');

module.exports = logger;