const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

const isProd = process.env.NODE_ENV === 'production';

const logsDirectory = path.join(__dirname, '..', '..', 'logs');
const expressLogsDirectory = path.join(logsDirectory, 'express');
const expressErrorsLogsDirectory = path.join(logsDirectory, 'express-errors');

if (!isProd) {
  fs.mkdirSync(expressLogsDirectory, { recursive: true });
  fs.mkdirSync(expressErrorsLogsDirectory, { recursive: true });
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) return `${timestamp} [${level}] ${message}\n${stack}`;
    return `${timestamp} [${level}] ${message}`;
  })
);

const transports = [];

if (isProd) {
  transports.push(
    new winston.transports.Console({
      format: jsonFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(expressLogsDirectory, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
      level: 'info',
      format: jsonFormat,
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(expressErrorsLogsDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d',
      level: 'error',
      format: jsonFormat,
    })
  );
}

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: jsonFormat,
  transports,
});

const expressLogger = expressWinston.logger({
  transports: [new winston.transports.Console({ format: consoleFormat })],
  meta: false,
  msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
});

const expressErrorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.Console({ format: jsonFormat })],
});

module.exports = {
  logger,
  expressLogger,
  expressErrorLogger,
};
