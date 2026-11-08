import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStallDto } from './dto/create-stall.dto';
import { FilterStallDto } from './dto/filter-stall.dto';
import { UpdateStallDto } from './dto/update-stall.dto';
import { Stall } from './entities/stall.entity';

@Injectable()
export class StallsRepository {
  constructor(
    @InjectRepository(Stall)
    private readonly ormRepo: Repository<Stall>,
  ) {}

  async findAll(filter: FilterStallDto): Promise<Stall[]> {
    const query = this.ormRepo.createQueryBuilder('stall');
    if (filter.is_open !== undefined) {
      query.andWhere('stall.is_open = :isOpen', { isOpen: filter.is_open });
    }
    query.orderBy('stall.id', 'ASC');
    return query.getMany();
  }

  async findById(id: number): Promise<Stall | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Stall | null> {
    return this.ormRepo.findOne({ where: { name } });
  }

  async create(dto: CreateStallDto): Promise<Stall> {
    const entity = this.ormRepo.create({
      name: dto.name,
      location: dto.location,
      is_open: dto.is_open ?? true,
    });
    return this.ormRepo.save(entity);
  }

  async update(stall: Stall, dto: UpdateStallDto): Promise<Stall> {
    Object.assign(stall, dto);
    return this.ormRepo.save(stall);
  }

  async remove(stall: Stall): Promise<void> {
    await this.ormRepo.remove(stall);
  }
}
