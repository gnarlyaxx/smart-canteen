import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

describe('OrdersService (Unit Test - Database Transaction)', () => {
  let service: OrdersService;
  let mockQueryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: {
      findOne: jest.Mock;
      save: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn((_, payload) => payload),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('1. Skenario Berhasil: memotong stok, menghitung subtotal & total_price, dan melakukan commitTransaction', async () => {
    const menuRecord = {
      id: 1,
      name: 'Soto Ayam Kampus',
      price: 12000,
      stock: 10,
      is_available: true,
    };
    mockQueryRunner.manager.findOne.mockResolvedValueOnce(menuRecord);
    mockQueryRunner.manager.save
      .mockResolvedValueOnce({ ...menuRecord, stock: 8 })
      .mockResolvedValueOnce({
        id: 101,
        customer_name: 'Rina',
        table_number: 'B-02',
        order_status: 'pending',
        total_price: 24000,
      })
      .mockResolvedValueOnce({
        id: 201,
        order_id: 101,
        menu_id: 1,
        quantity: 2,
        price: 12000,
        subtotal: 24000,
        notes: 'Tanpa seledri',
      });

    const createdOrder = await service.create({
      customer_name: 'Rina',
      table_number: 'B-02',
      items: [{ menu_id: 1, quantity: 2, notes: 'Tanpa seledri' }],
    });

    expect(createdOrder.total_price).toBe(24000);
    expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('2. Skenario Validasi Stok Gagal (400): melempar BadRequestException dan menjalankan rollbackTransaction saat stok tidak cukup', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValueOnce({
      id: 1,
      name: 'Soto Ayam Kampus',
      price: 12000,
      stock: 1,
      is_available: true,
    });

    await expect(
      service.create({
        customer_name: 'Rina',
        table_number: 'B-02',
        items: [{ menu_id: 1, quantity: 5 }],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('3. Skenario Menu Tidak Ditemukan (404): melempar NotFoundException dan menjalankan rollbackTransaction', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create({
        customer_name: 'Rina',
        table_number: 'B-02',
        items: [{ menu_id: 999, quantity: 1 }],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });
});
