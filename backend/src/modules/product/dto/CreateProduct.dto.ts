import { IsString, IsNumber, IsArray, ArrayMinSize, IsInt, MinLength, MaxLength, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15', description: 'Nome do produto' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Smartphone Apple...', description: 'Descrição do produto' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ example: 4999.99, description: 'Preço do produto (deve ser maior que zero)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  price!: number;

  @ApiProperty({ example: [1, 2], description: 'IDs das categorias (mínimo uma)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Produto deve ter pelo menos uma categoria.' })
  @IsInt({ each: true })
  categoryIds!: number[];
}