import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as yaml from 'yaml';
import { ProblemDetailsExceptionFilter } from './filters/problem-details.filter';

export function configureApp(
  app: INestApplication,
  options: { exportOpenApiYaml?: boolean } = { exportOpenApiYaml: true },
): OpenAPIObject {
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new ProblemDetailsExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Canteen REST API')
    .setDescription(
      'Dokumentasi kontrak REST API Aplikasi Pemesanan Kantin Kampus (Smart Canteen) — mencakup manajemen Stan (Stalls), Menu (Filtering, Offset Pagination, Tie-breaker Sorting, ETag & Optimistic Locking), serta Pesanan Transaksional (Orders) dengan standar error RFC 7807 / RFC 9457 Problem Details.',
    )
    .setVersion('1.0.0')
    .addTag('Stalls', 'Manajemen data stan kantin kampus')
    .addTag('Menus', 'Manajemen katalog menu, stok, dan ETag optimistic locking')
    .addTag('Orders', 'Pemesanan menu kantin dengan transaksi database atomik')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  if (options.exportOpenApiYaml) {
    const outputPath = path.resolve(process.cwd(), 'openapi.yaml');
    fs.writeFileSync(outputPath, yaml.stringify(document), 'utf8');
  }

  return document;
}
