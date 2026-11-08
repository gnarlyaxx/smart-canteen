import * as fs from 'node:fs';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/setup-app';

describe('Smart Canteen REST API (E2E Testing - Pertemuan 5, 6, 7)', () => {
  let app: INestApplication<App>;
  let stallId: number;
  let menuMakananId: number;
  let menuMinumanId: number;
  let initialMenuEtag: string;
  let orderId: number;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'sqljs';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, { exportOpenApiYaml: true });
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('0. Verifikasi Export OpenAPI Specification (openapi.yaml)', () => {
    it('harus men-generate file openapi.yaml di root project secara otomatis', () => {
      const openApiPath = path.resolve(process.cwd(), 'openapi.yaml');
      expect(fs.existsSync(openApiPath)).toBe(true);
      const content = fs.readFileSync(openApiPath, 'utf8');
      expect(content).toContain('Smart Canteen REST API');
      expect(content).toContain('/api/v1/menus');
      expect(content).toContain('/api/v1/orders');
    });
  });

  describe('1. Skenario Berhasil (200 OK, 201 Created, 204 No Content)', () => {
    it('POST /api/v1/stalls -> 201 Created (Membuat Stan Kantin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/stalls')
        .send({
          name: 'Kantin Nusantara Gedung A',
          location: 'Gedung A Lantai 1 No. 2',
          is_open: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Kantin Nusantara Gedung A');
      stallId = res.body.id;
    });

    it('GET /api/v1/stalls?is_open=true -> 200 OK (Daftar Stan dengan Filter)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stalls?is_open=true')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/menus -> 201 Created (Menambahkan 2 Menu Baru)', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/menus')
        .send({
          stall_id: stallId,
          name: 'Nasi Goreng Kampus Spesial',
          category: 'makanan',
          price: 15000,
          stock: 10,
          is_available: true,
        })
        .expect(201);

      expect(res1.body.id).toBeDefined();
      expect(res1.body.version).toBe(1);
      menuMakananId = res1.body.id;

      const res2 = await request(app.getHttpServer())
        .post('/api/v1/menus')
        .send({
          stall_id: stallId,
          name: 'Es Teh Manis Jumbo',
          category: 'minuman',
          price: 5000,
          stock: 8,
          is_available: true,
        })
        .expect(201);

      menuMinumanId = res2.body.id;
    });

    it('GET /api/v1/menus -> 200 OK (Filtering, Offset Pagination & Tie-breaker Sorting)', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/menus?stall_id=${stallId}&min_price=4000&max_price=20000&page=1&limit=10&sort=price:asc,id:asc`,
        )
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toEqual({
        total_items: 2,
        item_count: 2,
        items_per_page: 10,
        total_pages: 1,
        current_page: 1,
      });
      expect(res.body.data[0].price).toBe(5000);
      expect(res.body.data[1].price).toBe(15000);
    });

    it('GET /api/v1/menus/:id -> 200 OK & menyertakan header ETag', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/menus/${menuMakananId}`)
        .expect(200);

      expect(res.headers['etag']).toBeDefined();
      expect(res.headers['etag']).toBe('"v1"');
      initialMenuEtag = res.headers['etag'];
    });

    it('PATCH /api/v1/menus/:id -> 200 OK saat header If-Match cocok dengan ETag saat ini', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/menus/${menuMakananId}`)
        .set('If-Match', initialMenuEtag)
        .send({ price: 16000 })
        .expect(200);

      expect(res.body.price).toBe(16000);
      expect(res.body.version).toBe(2);
      expect(res.headers['etag']).toBe('"v2"');
    });

    it('POST /api/v1/orders -> 201 Created (Transaksi Order Berhasil & Stok Menu Terpotong)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          customer_name: 'Andi Pratama',
          table_number: 'C-05',
          items: [
            {
              menu_id: menuMakananId,
              quantity: 2,
              notes: 'Pedas sedang',
            },
            {
              menu_id: menuMinumanId,
              quantity: 1,
            },
          ],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      // 2 * 16000 + 1 * 5000 = 37000
      expect(res.body.total_price).toBe(37000);
      expect(res.body.order_status).toBe('pending');
      expect(res.body.items).toHaveLength(2);
      orderId = res.body.id;

      // Pastikan stok menu benar-benar berkurang dari 10 menjadi 8
      const menuCheck = await request(app.getHttpServer())
        .get(`/api/v1/menus/${menuMakananId}`)
        .expect(200);
      expect(menuCheck.body.stock).toBe(8);
    });

    it('PATCH /api/v1/orders/:id/status -> 200 OK (Update Status Order)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/status`)
        .send({ order_status: 'processing' })
        .expect(200);

      expect(res.body.order_status).toBe('processing');
    });
  });

  describe('2. Skenario Validasi Gagal & Rollback Transaksi (400 Bad Request - RFC 7807)', () => {
    it('POST /api/v1/menus -> 400 Bad Request saat harga negatif / di bawah 1000', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/menus')
        .send({
          stall_id: stallId,
          name: 'Menu Harga Tidak Valid',
          category: 'snack',
          price: -5000,
          stock: 10,
        })
        .expect(400);

      expect(res.body).toMatchObject({
        type: 'https://smartcanteen.ac.id/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        instance: '/api/v1/menus',
      });
      expect(res.body.detail).toContain('Harga menu minimal adalah 1000');
    });

    it('POST /api/v1/orders -> 400 Bad Request saat stok tidak mencukupi & Rollback menjaga stok menu pertama tetap utuh', async () => {
      // Sebelum transaksi gagal: menuMakananId memiliki stok 8, menuMinumanId memiliki stok 7
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          customer_name: 'Siti Rahma',
          table_number: 'D-01',
          items: [
            { menu_id: menuMakananId, quantity: 3 }, // Cukup (stok 8)
            { menu_id: menuMinumanId, quantity: 99 }, // Tidak cukup (stok 7) -> picu Rollback!
          ],
        })
        .expect(400);

      expect(res.body).toMatchObject({
        type: 'https://smartcanteen.ac.id/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        instance: '/api/v1/orders',
      });
      expect(res.body.detail).toContain('Stok menu tidak mencukupi');

      // Buktikan transaksi di-rollback: stok menuMakananId wajib tetap 8 (tidak terpotong 3)
      const menuCheck = await request(app.getHttpServer())
        .get(`/api/v1/menus/${menuMakananId}`)
        .expect(200);
      expect(menuCheck.body.stock).toBe(8);
    });
  });

  describe('3. Skenario Data Tidak Ditemukan (404 Not Found - RFC 7807)', () => {
    it('GET /api/v1/menus/:id -> 404 Not Found saat akses ID menu tidak terdaftar', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/menus/99999')
        .expect(404);

      expect(res.body).toEqual({
        type: 'https://smartcanteen.ac.id/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Menu dengan ID 99999 tidak ditemukan',
        instance: '/api/v1/menus/99999',
      });
    });

    it('GET /api/v1/orders/:id -> 404 Not Found saat akses ID order tidak terdaftar', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders/99999')
        .expect(404);

      expect(res.body).toEqual({
        type: 'https://smartcanteen.ac.id/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Pesanan dengan ID 99999 tidak ditemukan',
        instance: '/api/v1/orders/99999',
      });
    });

    it('POST /api/v1/orders -> 404 Not Found & Rollback saat salah satu menu_id tidak ditemukan', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          customer_name: 'Doni',
          table_number: 'A-01',
          items: [
            { menu_id: menuMakananId, quantity: 2 },
            { menu_id: 88888, quantity: 1 },
          ],
        })
        .expect(404);

      expect(res.body).toMatchObject({
        type: 'https://smartcanteen.ac.id/errors/not-found',
        title: 'Not Found',
        status: 404,
        instance: '/api/v1/orders',
      });

      // Stok menuMakananId wajib tetap 8 karena transaksi di-rollback
      const menuCheck = await request(app.getHttpServer())
        .get(`/api/v1/menus/${menuMakananId}`)
        .expect(200);
      expect(menuCheck.body.stock).toBe(8);
    });
  });

  describe('4. Skenario Konflik Data & Optimistic Locking (409 Conflict & 412 Precondition Failed)', () => {
    it('POST /api/v1/menus -> 409 Conflict saat nama menu duplikat', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/menus')
        .send({
          stall_id: stallId,
          name: 'Nasi Goreng Kampus Spesial',
          category: 'makanan',
          price: 15000,
          stock: 15,
        })
        .expect(409);

      expect(res.body).toEqual({
        type: 'https://smartcanteen.ac.id/errors/conflict',
        title: 'Conflict',
        status: 409,
        detail: "Menu dengan nama 'Nasi Goreng Kampus Spesial' sudah terdaftar",
        instance: '/api/v1/menus',
      });
    });

    it('POST /api/v1/stalls -> 409 Conflict saat nama stan duplikat', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/stalls')
        .send({
          name: 'Kantin Nusantara Gedung A',
          location: 'Gedung B',
        })
        .expect(409);

      expect(res.body).toMatchObject({
        type: 'https://smartcanteen.ac.id/errors/conflict',
        title: 'Conflict',
        status: 409,
        instance: '/api/v1/stalls',
      });
    });

    it('PUT /api/v1/menus/:id -> 412 Precondition Failed saat ETag If-Match usang/salah', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/menus/${menuMakananId}`)
        .set('If-Match', '"v1"') // ETag saat ini sudah berubah setelah update & order
        .send({
          stall_id: stallId,
          name: 'Nasi Goreng Kampus Spesial',
          category: 'makanan',
          price: 20000,
          stock: 25,
          is_available: true,
        })
        .expect(412);

      expect(res.body).toMatchObject({
        type: 'https://smartcanteen.ac.id/errors/precondition-failed',
        title: 'Precondition Failed',
        status: 412,
        instance: `/api/v1/menus/${menuMakananId}`,
      });
    });
  });
});
