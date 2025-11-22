const winston = require('winston');

const logFormat = process.env.NODE_ENV === 'production'
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json() 
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'thrivecorp-api' }, 
  transports: [
    new winston.transports.Console()
  ],
});

module.exports = logger;