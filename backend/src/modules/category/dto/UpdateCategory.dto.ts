import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './Create-category.dto';


export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}