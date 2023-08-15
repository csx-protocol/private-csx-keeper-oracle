/* eslint-disable prettier/prettier */

/**
 * @file - Custom Logger
 * @description - Custom logger that extends NestJS's ConsoleLogger
 *               and uses Winston to log to files
 */

import { ConsoleLogger, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { winstonConfig } from './winston.config';

export class CustomLogger extends ConsoleLogger implements LoggerService {
  private readonly winstonLogger: winston.Logger;

  constructor() {
    super();
    this.winstonLogger = winston.createLogger(winstonConfig);
  }

  log(message: any, context?: string) {
    super.log(message, context); // NestJS's ConsoleLogger will manage console output with default coloring
    this.winstonLogger.info(message);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.winstonLogger.error(message);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.winstonLogger.warn(message);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.winstonLogger.debug(message);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.winstonLogger.verbose(message);
  }
}
