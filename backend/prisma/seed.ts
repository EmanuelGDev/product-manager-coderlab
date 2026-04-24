import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Categorias raiz
  const eletronico = await prisma.category.create({
    data: { id: 1, name: 'Eletrônico' },
  });

  const carro = await prisma.category.create({
    data: { id: 2, name: 'Carro' },
  });

  const roupa = await prisma.category.create({
    data: { id: 3, name: 'Roupa' },
  });

  // Subcategorias de Eletrônico
  await prisma.category.createMany({
    data: [
      { id: 4, name: 'Celular', parentId: eletronico.id },
      { id: 5, name: 'Notebook', parentId: eletronico.id },
      { id: 6, name: 'Fone de Ouvido', parentId: eletronico.id },
    ],
  });

  // Subcategorias de Carro
  await prisma.category.createMany({
    data: [
      { id: 7, name: 'BMW', parentId: carro.id },
      { id: 8, name: 'Porsche', parentId: carro.id },
      { id: 9, name: 'Ferrari', parentId: carro.id },
    ],
  });

  // Subcategorias de Roupa
  await prisma.category.createMany({
    data: [
      { id: 10, name: 'Blusa', parentId: roupa.id },
      { id: 11, name: 'Calça', parentId: roupa.id },
      { id: 12, name: 'Tenis', parentId: roupa.id },
    ],
  });

  // Produtos
  await prisma.product.create({
    data: {
      id: 1,
      name: 'Notebook Dell X',
      description: 'notebook x de ram y de disco',
      price: 3200,
      categories: {
        create: [
          { categoryId: 1, assignedAt: new Date() },
          { categoryId: 5, assignedAt: new Date() },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      id: 2,
      name: 'Porsche 911 GT3 RS',
      description: 'carro esportivo para endurance',
      price: 1500000,
      categories: {
        create: [
          { categoryId: 2, assignedAt: new Date() },
          { categoryId: 8, assignedAt: new Date() },
        ],
      },
    },
  });

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });