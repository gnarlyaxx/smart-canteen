import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { CreateStallDto } from './dto/create-stall.dto';
import { FilterStallDto } from './dto/filter-stall.dto';
import { UpdateStallDto } from './dto/update-stall.dto';
import { Stall } from './entities/stall.entity';
import { StallsService } from './stalls.service';

@ApiTags('Stalls')
@Controller({ path: 'stalls', version: '1' })
export class StallsController {
  constructor(private readonly stallsService: StallsService) {}

  @Get()
  @ApiOperation({
    summary: 'Mengambil daftar stan kantin',
    description: 'Mendukung filter opsional berdasarkan status buka/tutup (is_open).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar stan berhasil diambil',
    type: [Stall],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parameter query tidak valid',
    type: ProblemDetailsDto,
  })
  async findAll(@Query() filter: FilterStallDto): Promise<Stall[]> {
    return this.stallsService.findAll(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mendaftarkan stan kantin baru' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Stan kantin berhasil dibuat',
    type: Stall,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi input gagal',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nama stan sudah digunakan',
    type: ProblemDetailsDto,
  })
  async create(@Body() dto: CreateStallDto): Promise<Stall> {
    return this.stallsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil detail stan kantin berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail stan ditemukan',
    type: Stall,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stan tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Stall> {
    return this.stallsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui data stan kantin berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data stan berhasil diperbarui',
    type: Stall,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi input gagal',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stan tidak ditemukan',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nama stan duplikat dengan stan lain',
    type: ProblemDetailsDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStallDto,
  ): Promise<Stall> {
    return this.stallsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus stan kantin berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Stan berhasil dihapus (204 No Content)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stan tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.stallsService.remove(id);
  }
}
