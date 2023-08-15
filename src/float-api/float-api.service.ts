/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, of, firstValueFrom } from 'rxjs';

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
    const obs$ = this.httpService.get<any>(TEMP_API + inspectLink).pipe(
      catchError((error) => {
        if (error.status === 500) {
          return of(ErrorMessages[ErrorCodes.InternalError]);
        } else {
          this.logger.error('Float-API ERROR', error);
          if (error.error.code as number) {
            const number: number = error.error.code;
            return of(ErrorMessages[number as ErrorCodes]);
          }
          return of(ErrorMessages[ErrorCodes.InternalError]);
        }
      }),
    );
  
    // Convert the Observable to a Promise
    const result = await firstValueFrom(obs$);
  
    return result;
  }
}
