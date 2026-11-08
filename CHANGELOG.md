# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0] - 2026-11-08
### Added
- Konfigurasi global prefix `/api`, URI Versioning `/api/v1/...`, global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), dan `ProblemDetailsExceptionFilter` sesuai standar RFC 7807 / RFC 9457.
- Entitas TypeORM (`Stall`, `Menu`, `Order`, `OrderItem`) beserta constraint database (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `@VersionColumn`) dan file migration PostgreSQL (`1730000000000-InitialSmartCanteenSchema.ts`).
- Modul `Stalls` (`/api/v1/stalls`), `Menus` (`/api/v1/menus` dengan filtering, offset pagination, tie-breaker sorting `id:asc`, serta `ETag` / `If-Match` optimistic locking), dan `Orders` (`/api/v1/orders` dengan transaksi atomik `QueryRunner`).
- Konfigurasi Swagger UI pada `/api/docs` dan auto-export spesifikasi OpenAPI 3.0 ke `openapi.yaml`.
- Unit Test (`menus.service.spec.ts`, `orders.service.spec.ts`) dan E2E Test (`test/app.e2e-spec.ts`) mencakup 4 skenario pengujian kontrak API.
