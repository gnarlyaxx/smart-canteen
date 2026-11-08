import {
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { StallsService } from '../stalls/stalls.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { PaginatedMenuResponseDto, QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { MenusRepository } from './menus.repository';

@Injectable()
export class MenusService {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly stallsService: StallsService,
  ) {}

  formatEtag(menu: Menu): string {
    return `"v${menu.version}"`;
  }

  private normalizeEtag(etag: string): string {
    return etag.trim().replace(/^W\//i, '').replace(/^"|"$/g, '');
  }

  async findAll(queryDto: QueryMenuDto): Promise<PaginatedMenuResponseDto> {
    return this.menusRepository.findPaginated(queryDto);
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menusRepository.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }
    return menu;
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    await this.stallsService.findOne(dto.stall_id);

    const existing = await this.menusRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Menu dengan nama '${dto.name}' sudah terdaftar`,
      );
    }

    return this.menusRepository.create(dto);
  }

  async update(
    id: number,
    dto: UpdateMenuDto,
    ifMatchHeader?: string,
  ): Promise<Menu> {
    const menu = await this.findOne(id);

    if (ifMatchHeader !== undefined && ifMatchHeader.trim() !== '') {
      const currentVersionTag = `v${menu.version}`;
      const incomingTag = this.normalizeEtag(ifMatchHeader);
      if (incomingTag !== currentVersionTag) {
        throw new PreconditionFailedException(
          `ETag tidak cocok: versi saat ini adalah "v${menu.version}", sedangkan If-Match mengirim "${incomingTag}"`,
        );
      }
    }

    if (dto.stall_id !== undefined && dto.stall_id !== menu.stall_id) {
      await this.stallsService.findOne(dto.stall_id);
    }

    if (dto.name && dto.name !== menu.name) {
      const duplicate = await this.menusRepository.findByName(dto.name);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `Menu dengan nama '${dto.name}' sudah terdaftar`,
        );
      }
    }

    return this.menusRepository.update(menu, dto);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menusRepository.remove(menu);
  }
}
