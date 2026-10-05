import { Router } from 'express';
import prisma from '../lib/prisma';
import { CreateMenuItemDto } from '../types';

const router = Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true,
        station: true,
        recipeItems: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get categories (must be defined before /:id to avoid route conflict)
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        station: true,
        recipeItems: {
          include: { ingredient: true },
        },
      },
    });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item
router.post('/', async (req, res) => {
  try {
    const data: CreateMenuItemDto = req.body;
    const menuItem = await prisma.menuItem.create({
      data,
      include: {
        category: true,
        station: true,
      },
    });
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        category: true,
        station: true,
      },
    });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.menuItem.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
