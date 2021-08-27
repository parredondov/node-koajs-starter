'use strict';
const { createLogger, format, transports } = require('winston');
const { identity } = require('ramda');
const pck = require('../../package.json');
const config = require('../config');

const { align, colorize, combine, label, printf, timestamp } = format;
const noFormat = format(identity);

/**
 * Sets up and returns a console logger.
 *
 * @see https://github.com/winstonjs/winston#usage
 * @param  {Object} options Winston logger options
 * @return {Logger} A console logger instance
 */
const createConsoleLogger = options => {
  const format = combine(
    options.colorize ? colorize() : noFormat(),
    options.align ? align() : noFormat(),
    label({ label: options.label }),
    timestamp({ format: options.timestamp }),
    printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
  );

  return createLogger({
    format,
    ...options,
    transports: [new transports.Console()]
  });
};

module.exports = createConsoleLogger({ label: pck.name, ...config.logger });
