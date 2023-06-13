/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, of } from 'rxjs';

@Injectable()
export class FloatApiService {
  private readonly logger = new Logger(FloatApiService.name);
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    this.logger.log('FloatApiService dependencies injected');
  }

  async getFloat(inspectLink: string): Promise<any> {
    const TEMP_API = 'http://localhost:1337/?url=';
    return this.httpService.get<any>(TEMP_API + inspectLink).pipe(
      catchError((error) => {
        if (error.status === 500) {
          return of(ErrorMessages[ErrorCodes.InternalError]);
        } else {
          console.log('ERRRRRR', error);
          if (error.error.code as number) {
            const number: number = error.error.code;
            return of(ErrorMessages[number as ErrorCodes]);
          }
          return of(ErrorMessages[ErrorCodes.InternalError]);
        }
      }),
    );
  }
}
