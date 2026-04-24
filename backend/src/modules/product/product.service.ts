import { Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { UpdateProductDto } from './dto/UpdateProduct.dto';


@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    await this.ensureCategoriesExist(dto.categoryIds);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryIds !== undefined) {
      if (dto.categoryIds.length === 0) {
        throw new BadRequestException('Produto deve ter pelo menos uma categoria.');
      }

      await this.ensureCategoriesExist(dto.categoryIds);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        // Substitui todas as categorias pelas novas quando informadas
        ...(dto.categoryIds && {
          categories: {
            deleteMany: {},
            create: dto.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: {
        categories: { include: { category: true } },
      },
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    // Remove registros da tabela intermediária antes de deletar o produto
    await this.prisma.productCategory.deleteMany({
      where: { productId: id },
    });

    await this.prisma.product.delete({ where: { id } });

    return { message: `Produto "${product.name}" removido com sucesso.` };
  }

  // ----------------------------------------------------------------
  // Helpers privados
  // ----------------------------------------------------------------

  private async ensureCategoriesExist(categoryIds: number[]) {
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map((c) => c.id);
      const notFound = categoryIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Categorias não encontradas: ${notFound.join(', ')}.`,
      );
    }
  }
}