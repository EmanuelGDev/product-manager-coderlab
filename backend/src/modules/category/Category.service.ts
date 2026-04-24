import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateCategoryDto } from './dto/Create-category.dto';
import { UpdateCategoryDto } from './dto/UpdateCategory.dto';


@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    
    if (dto.parentId) {
      await this.ensureParentExists(dto.parentId);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          include: { product: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Uma categoria não pode ser pai dela mesma.');
      }

      if (dto.parentId !== null) {
        await this.ensureParentExists(dto.parentId);

        const hasLoop = await this.detectLoop(id, dto.parentId);
        if (hasLoop) {
          throw new BadRequestException(
            'Operação inválida: causaria um loop na hierarquia de categorias.',
          );
        }
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        parentId: dto.parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    if (category.children.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que possui subcategorias.',
      );
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que possui produtos associados.',
      );
    }

    await this.prisma.category.delete({ where: { id } });

    return { message: `Categoria "${category.name}" removida com sucesso.` };
  }

  // ----------------------------------------------------------------
  // Helpers privados
  // ----------------------------------------------------------------

  private async ensureParentExists(parentId: number) {
    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(
        `Categoria pai com ID ${parentId} não encontrada.`,
      );
    }
  }

  /**
   * Sobe a árvore a partir de `newParentId` verificando se
   * em algum momento chega em `categoryId` (indicando loop).
   */
  private async detectLoop(
    categoryId: number,
    newParentId: number,
  ): Promise<boolean> {
    let current: number | null = newParentId;

    while (current !== null) {
      if (current === categoryId) return true;

      const parent = await this.prisma.category.findUnique({
        where: { id: current },
        select: { parentId: true },
      });

      current = parent?.parentId ?? null;
    }

    return false;
  }
}