import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from './winston.config';
import { CustomLogger } from './custom.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: WinstonModule.createLogger(winstonConfig), To use only Winston, don't forget to uncomment transport in winston config.
    logger: new CustomLogger(),
  });
  await app.listen(3008);
}
bootstrap();
