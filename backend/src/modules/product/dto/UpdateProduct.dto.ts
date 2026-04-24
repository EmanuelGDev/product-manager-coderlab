import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './CreateProduct.dto';


export class UpdateProductDto extends PartialType(CreateProductDto) {}