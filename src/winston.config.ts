/* eslint-disable prettier/prettier */
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = {
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    nestWinstonModuleUtilities.format.nestLike(),
  ),
  transports: [
    // new winston.transports.Console({
    //   format: winston.format.combine(
    //     winston.format.timestamp(),
    //     winston.format.colorize(),
    //     winston.format.printf(({ timestamp, level, message, trace }) => {
    //       return `${timestamp} ${level}: ${message} ${trace || ''}`;
    //     }),
    //   ),
    // }),
    new winston.transports.File({
      filename: 'application.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
