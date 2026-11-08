import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStallDto } from './dto/create-stall.dto';
import { FilterStallDto } from './dto/filter-stall.dto';
import { UpdateStallDto } from './dto/update-stall.dto';
import { Stall } from './entities/stall.entity';
import { StallsRepository } from './stalls.repository';

@Injectable()
export class StallsService {
  constructor(private readonly stallsRepository: StallsRepository) {}

  async findAll(filter: FilterStallDto): Promise<Stall[]> {
    return this.stallsRepository.findAll(filter);
  }

  async findOne(id: number): Promise<Stall> {
    const stall = await this.stallsRepository.findById(id);
    if (!stall) {
      throw new NotFoundException(`Stan dengan ID ${id} tidak ditemukan`);
    }
    return stall;
  }

  async create(dto: CreateStallDto): Promise<Stall> {
    const existing = await this.stallsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Stan dengan nama '${dto.name}' sudah terdaftar`,
      );
    }
    return this.stallsRepository.create(dto);
  }

  async update(id: number, dto: UpdateStallDto): Promise<Stall> {
    const stall = await this.findOne(id);
    if (dto.name && dto.name !== stall.name) {
      const duplicate = await this.stallsRepository.findByName(dto.name);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `Stan dengan nama '${dto.name}' sudah terdaftar`,
        );
      }
    }
    return this.stallsRepository.update(stall, dto);
  }

  async remove(id: number): Promise<void> {
    const stall = await this.findOne(id);
    await this.stallsRepository.remove(stall);
  }
}
