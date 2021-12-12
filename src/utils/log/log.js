/**
 * @file Logger
 * @author HARCIS-DEV TEAM
 */

var winston = require('winston');
const nodeEnv = process.env.NODE_ENV || 'development';
const logsDir = './logs/';
/**
 * Logger utils
 * Creates two log files
 */
const logger = winston.createLogger({
    level: nodeEnv === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({
            stack: true
        }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {
        service: 'graph-api'
    },
    transports: [
        new winston.transports.File({
            filename: `${logsDir}error.log`,
            level: 'error'
        }),
        new winston.transports.File({
            filename: `${logsDir}combined.log`
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    ],
});
module.exports = logger;