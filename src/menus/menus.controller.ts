import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { PaginatedMenuResponseDto, QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { MenusService } from './menus.service';

@ApiTags('Menus')
@Controller({ path: 'menus', version: '1' })
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({
    summary: 'Mengambil daftar menu kantin (Filtering, Offset Pagination & Tie-breaker Sorting)',
    description:
      'Mendukung filter category, stall_id, min_price, max_price, offset pagination (page & limit), serta sorting dengan tie-breaker id:asc.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar menu dengan metadata pagination berhasil diambil',
    type: PaginatedMenuResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parameter query tidak valid',
    type: ProblemDetailsDto,
  })
  async findAll(
    @Query() queryDto: QueryMenuDto,
  ): Promise<PaginatedMenuResponseDto> {
    return this.menusService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mengambil detail menu berdasarkan ID (menyertakan header ETag)',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail menu berhasil ditemukan (disertai header ETag)',
    type: Menu,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Menu> {
    const menu = await this.menusService.findOne(id);
    res.setHeader('ETag', this.menusService.formatEtag(menu));
    return menu;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Menambahkan menu kantin baru' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Menu berhasil ditambahkan',
    type: Menu,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi input gagal (misal harga < 1000 atau stok negatif)',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stan (stall_id) tidak ditemukan',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nama menu sudah terdaftar (409 Conflict)',
    type: ProblemDetailsDto,
  })
  async create(
    @Body() dto: CreateMenuDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Menu> {
    const created = await this.menusService.create(dto);
    res.setHeader('ETag', this.menusService.formatEtag(created));
    return created;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Memperbarui seluruh data menu (mendukung Optimistic Locking via If-Match ETag)',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiHeader({
    name: 'If-Match',
    required: false,
    description: 'Nilai ETag versi menu saat ini (contoh: "v1")',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu berhasil diperbarui',
    type: Menu,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi input gagal',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu tidak ditemukan',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nama menu konflik dengan menu lain',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.PRECONDITION_FAILED,
    description: 'Header If-Match tidak cocok dengan ETag menu saat ini (412 Precondition Failed)',
    type: ProblemDetailsDto,
  })
  async updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Menu> {
    const updated = await this.menusService.update(id, dto, ifMatch);
    res.setHeader('ETag', this.menusService.formatEtag(updated));
    return updated;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Memperbarui sebagian data menu (mendukung Optimistic Locking via If-Match ETag)',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiHeader({
    name: 'If-Match',
    required: false,
    description: 'Nilai ETag versi menu saat ini (contoh: "v1")',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu berhasil diperbarui',
    type: Menu,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi input gagal',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu tidak ditemukan',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nama menu konflik dengan menu lain',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.PRECONDITION_FAILED,
    description: 'Header If-Match tidak cocok dengan ETag menu saat ini (412 Precondition Failed)',
    type: ProblemDetailsDto,
  })
  async updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Menu> {
    const updated = await this.menusService.update(id, dto, ifMatch);
    res.setHeader('ETag', this.menusService.formatEtag(updated));
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus menu berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Menu berhasil dihapus (204 No Content)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.menusService.remove(id);
  }
}
