import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './common/setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app, { exportOpenApiYaml: true });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
