import {
  ConflictException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StallsService } from '../stalls/stalls.service';
import { Menu } from './entities/menu.entity';
import { MenusRepository } from './menus.repository';
import { MenusService } from './menus.service';

describe('MenusService (Unit Test)', () => {
  let service: MenusService;
  let menusRepo: jest.Mocked<MenusRepository>;
  let stallsService: jest.Mocked<StallsService>;

  const sampleMenu: Menu = {
    id: 1,
    stall_id: 1,
    name: 'Nasi Ayam Geprek Kampus',
    category: 'makanan',
    price: 15000,
    stock: 20,
    is_available: true,
    version: 1,
    created_at: new Date('2026-11-08T10:00:00Z'),
    updated_at: new Date('2026-11-08T10:00:00Z'),
    stall: undefined as never,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        {
          provide: MenusRepository,
          useValue: {
            findPaginated: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: StallsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
    menusRepo = module.get(MenusRepository);
    stallsService = module.get(StallsService);
  });

  it('1. Skenario Berhasil: berhasil membuat menu baru dan menghasilkan ETag "v1"', async () => {
    stallsService.findOne.mockResolvedValue({ id: 1 } as never);
    menusRepo.findByName.mockResolvedValue(null);
    menusRepo.create.mockResolvedValue(sampleMenu);

    const created = await service.create({
      stall_id: 1,
      name: 'Nasi Ayam Geprek Kampus',
      category: 'makanan',
      price: 15000,
      stock: 20,
    });

    expect(created.id).toBe(1);
    expect(service.formatEtag(created)).toBe('"v1"');
  });

  it('2. Skenario Data Tidak Ditemukan (404): melempar NotFoundException jika ID menu tidak terdaftar', async () => {
    menusRepo.findById.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('3. Skenario Konflik Data (409): melempar ConflictException jika nama menu duplikat', async () => {
    stallsService.findOne.mockResolvedValue({ id: 1 } as never);
    menusRepo.findByName.mockResolvedValue(sampleMenu);

    await expect(
      service.create({
        stall_id: 1,
        name: 'Nasi Ayam Geprek Kampus',
        category: 'makanan',
        price: 15000,
        stock: 10,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('4. Skenario Optimistic Locking Gagal (412): melempar PreconditionFailedException jika header If-Match tidak cocok', async () => {
    menusRepo.findById.mockResolvedValue(sampleMenu);

    await expect(
      service.update(1, { price: 17000 }, '"v99"'),
    ).rejects.toThrow(PreconditionFailedException);
  });
});
