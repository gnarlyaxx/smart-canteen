import { ApiProperty } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({
    example: 'https://smartcanteen.ac.id/errors/bad-request',
    description: 'URI referensi yang mengidentifikasi jenis masalah (RFC 7807 / RFC 9457)',
  })
  type: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Ringkasan singkat masalah yang dapat dibaca manusia',
  })
  title: string;

  @ApiProperty({
    example: 400,
    description: 'Kode status HTTP yang dihasilkan oleh server',
  })
  status: number;

  @ApiProperty({
    example: 'price must not be less than 1000',
    description: 'Penjelasan spesifik mengenai kemunculan masalah ini',
  })
  detail: string;

  @ApiProperty({
    example: '/api/v1/menus',
    description: 'URI yang mengidentifikasi kemunculan spesifik dari masalah ini',
  })
  instance: string;
}
