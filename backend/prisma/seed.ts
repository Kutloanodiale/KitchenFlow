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

  // Create menu items
  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and cheese',
        price: 12.99,
        estimatedTime: 15,
        categoryId: categories[1].id, // Main Course
        stationId: stations[0].id, // GRILL
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Chicken Sandwich',
        description: 'Grilled chicken breast with fresh vegetables',
        price: 10.99,
        estimatedTime: 12,
        categoryId: categories[1].id, // Main Course
        stationId: stations[0].id, // GRILL
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 4.99,
        estimatedTime: 8,
        categoryId: categories[0].id, // Appetizers
        stationId: stations[1].id, // FRYER
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Cola',
        description: 'Refreshing cola drink',
        price: 2.50,
        estimatedTime: 2,
        categoryId: categories[3].id, // Beverages
        stationId: stations[2].id, // DRINKS
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing',
        price: 8.99,
        estimatedTime: 10,
        categoryId: categories[0].id, // Appetizers
        stationId: stations[3].id, // COLD_PREP
        available: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake',
        price: 6.99,
        estimatedTime: 5,
        categoryId: categories[2].id, // Desserts
        stationId: stations[4].id, // DESSERT
        available: true,
      },
    }),
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
