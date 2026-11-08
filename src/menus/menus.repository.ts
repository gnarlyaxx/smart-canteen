import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { PaginatedMenuResponseDto, QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';

const ALLOWED_SORT_FIELDS = new Set([
  'id',
  'name',
  'category',
  'price',
  'stock',
  'created_at',
  'updated_at',
]);

@Injectable()
export class MenusRepository {
  constructor(
    @InjectRepository(Menu)
    private readonly ormRepo: Repository<Menu>,
  ) {}

  async findPaginated(queryDto: QueryMenuDto): Promise<PaginatedMenuResponseDto> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const qb = this.ormRepo.createQueryBuilder('menu');

    if (queryDto.category) {
      qb.andWhere('menu.category = :category', { category: queryDto.category });
    }
    if (queryDto.stall_id !== undefined) {
      qb.andWhere('menu.stall_id = :stallId', { stallId: queryDto.stall_id });
    }
    if (queryDto.min_price !== undefined) {
      qb.andWhere('menu.price >= :minPrice', { minPrice: queryDto.min_price });
    }
    if (queryDto.max_price !== undefined) {
      qb.andWhere('menu.price <= :maxPrice', { maxPrice: queryDto.max_price });
    }

    let hasIdSort = false;
    if (queryDto.sort && queryDto.sort.trim().length > 0) {
      const sortParts = queryDto.sort.split(',').map((part) => part.trim());
      sortParts.forEach((part, index) => {
        const [field, rawDir] = part.split(':');
        const direction = (rawDir || 'asc').toUpperCase();
        if (
          !field ||
          !ALLOWED_SORT_FIELDS.has(field) ||
          (direction !== 'ASC' && direction !== 'DESC')
        ) {
          throw new BadRequestException(
            `Format parameter sort tidak valid: '${part}'. Gunakan format field:asc|desc`,
          );
        }
        if (field === 'id') {
          hasIdSort = true;
        }
        if (index === 0) {
          qb.orderBy(`menu.${field}`, direction as 'ASC' | 'DESC');
        } else {
          qb.addOrderBy(`menu.${field}`, direction as 'ASC' | 'DESC');
        }
      });
    } else {
      qb.orderBy('menu.created_at', 'DESC');
    }

    if (!hasIdSort) {
      qb.addOrderBy('menu.id', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      data: items,
      meta: {
        total_items: totalItems,
        item_count: items.length,
        items_per_page: limit,
        total_pages: totalPages,
        current_page: page,
      },
    };
  }

  async findById(id: number): Promise<Menu | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Menu | null> {
    return this.ormRepo.findOne({ where: { name } });
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const entity = this.ormRepo.create({
      stall_id: dto.stall_id,
      name: dto.name,
      category: dto.category,
      price: dto.price,
      stock: dto.stock,
      is_available: dto.is_available ?? true,
    });
    return this.ormRepo.save(entity);
  }

  async update(menu: Menu, dto: UpdateMenuDto): Promise<Menu> {
    Object.assign(menu, dto);
    return this.ormRepo.save(menu);
  }

  async remove(menu: Menu): Promise<void> {
    await this.ormRepo.remove(menu);
  }
}
