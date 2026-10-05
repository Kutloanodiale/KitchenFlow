import { Router } from 'express';
import prisma from '../lib/prisma';
import { CreateIngredientDto, RecipeItemDto } from '../types';

const router = Router();

// Get all ingredients
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Get low stock ingredients
router.get('/ingredients/low-stock', async (req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: {
        currentStock: {
          lte: prisma.ingredient.fields.minStock,
        },
      },
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock ingredients' });
  }
});

// Create ingredient
router.post('/ingredients', async (req, res) => {
  try {
    const data: CreateIngredientDto = req.body;
    const ingredient = await prisma.ingredient.create({ data });
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// Update ingredient
router.put('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await prisma.ingredient.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Get recipe for menu item
router.get('/recipes/:menuItemId', async (req, res) => {
  try {
    const recipeItems = await prisma.recipeItem.findMany({
      where: { menuItemId: req.params.menuItemId },
      include: { ingredient: true },
    });
    res.json(recipeItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Add recipe item
router.post('/recipes/:menuItemId', async (req, res) => {
  try {
    const data: RecipeItemDto = req.body;
    const recipeItem = await prisma.recipeItem.create({
      data: {
        menuItemId: req.params.menuItemId,
        ...data,
      },
      include: { ingredient: true },
    });
    res.status(201).json(recipeItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add recipe item' });
  }
});

// Get inventory movements
router.get('/movements', async (req, res) => {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: { ingredient: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory movements' });
  }
});

export default router;
