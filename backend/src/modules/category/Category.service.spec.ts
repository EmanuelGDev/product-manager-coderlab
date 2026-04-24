import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaMock = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    it('deve criar categoria sem pai', async () => {
      prismaMock.category.create.mockResolvedValue({ id: 1, name: 'Eletrônicos' });

      const result = await service.create({ name: 'Eletrônicos' });

      expect(result).toEqual({ id: 1, name: 'Eletrônicos' });
      expect(prismaMock.category.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'Eletrônicos', parentId: null } }),
      );
    });

    it('deve lançar NotFoundException se categoria pai não existir', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(service.create({ name: 'Sub', parentId: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------------------
  // findOne
  // ----------------------------------------------------------------
  describe('findOne', () => {
    it('deve lançar NotFoundException se não encontrar', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------------------
  // update — loop detection
  // ----------------------------------------------------------------
  describe('update', () => {
    it('deve lançar BadRequestException se categoria for pai dela mesma', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'A',
        children: [],
        products: [],
      });

      await expect(service.update(1, { parentId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve detectar loop de hierarquia', async () => {
      // findOne retorna categoria existente
      prismaMock.category.findUnique
        .mockResolvedValueOnce({ id: 1, name: 'A', children: [], products: [] }) // findOne
        .mockResolvedValueOnce({ id: 3, parentId: 2 })   // detectLoop: current=3
        .mockResolvedValueOnce({ id: 2, parentId: 1 })   // detectLoop: current=2 → parentId=1 === categoryId
        // loop detectado antes de chamar novamente

      await expect(service.update(1, { parentId: 3 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ----------------------------------------------------------------
  // remove
  // ----------------------------------------------------------------
  describe('remove', () => {
    it('deve lançar BadRequestException se tiver subcategorias', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'A',
        children: [{ id: 2 }],
        products: [],
      });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se tiver produtos', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'A',
        children: [],
        products: [{ productId: 5 }],
      });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('deve remover categoria sem dependências', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'A',
        children: [],
        products: [],
      });
      prismaMock.category.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(result.message).toContain('removida com sucesso');
    });
  });
});