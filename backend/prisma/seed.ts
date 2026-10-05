import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Appetizers' } }),
    prisma.category.create({ data: { name: 'Main Course' } }),
    prisma.category.create({ data: { name: 'Desserts' } }),
    prisma.category.create({ data: { name: 'Beverages' } }),
  ]);

  // Create kitchen stations
  const stations = await Promise.all([
    prisma.kitchenStation.create({ data: { name: 'GRILL' } }),
    prisma.kitchenStation.create({ data: { name: 'FRYER' } }),
    prisma.kitchenStation.create({ data: { name: 'DRINKS' } }),
    prisma.kitchenStation.create({ data: { name: 'COLD_PREP' } }),
    prisma.kitchenStation.create({ data: { name: 'DESSERT' } }),
  ]);

  // Create ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Beef Patty', unit: 'pieces', currentStock: 100, minStock: 20 } }),
    prisma.ingredient.create({ data: { name: 'Burger Bun', unit: 'pieces', currentStock: 100, minStock: 20 } }),
    prisma.ingredient.create({ data: { name: 'Lettuce', unit: 'kg', currentStock: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Tomato', unit: 'kg', currentStock: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Cheese', unit: 'kg', currentStock: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Chicken Breast', unit: 'kg', currentStock: 50, minStock: 10 } }),
    prisma.ingredient.create({ data: { name: 'Oil', unit: 'liters', currentStock: 20, minStock: 5 } }),
    prisma.ingredient.create({ data: { name: 'Soda Syrup', unit: 'liters', currentStock: 15, minStock: 3 } }),
  ]);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
