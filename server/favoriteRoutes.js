import express from 'express';
import { dbStore } from './dbStore.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// 1. GET user's favorites (returns array of propertyIds)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userFavs = dbStore.favorites
      .filter(f => f.user_id === req.user.id)
      .map(f => f.property_id);
    return res.json({ favorites: userFavs });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return res.status(500).json({ error: 'Failed to retrieve favorites.' });
  }
});

// 2. POST Toggle favorite for a property
router.post('/:id', authenticateToken, async (req, res) => {
  const propertyId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if property exists
    const prop = dbStore.properties.find(p => p.id === propertyId);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    // Check if already favorited
    const existingIndex = dbStore.favorites.findIndex(f => f.user_id === userId && f.property_id === propertyId);

    if (existingIndex !== -1) {
      // Remove favorite
      dbStore.favorites.splice(existingIndex, 1);
      prop.favorites = Math.max(0, (prop.favorites || 0) - 1);
      return res.json({ favorited: false });
    } else {
      // Add favorite
      const favoriteId = `fav-${Date.now()}`;
      dbStore.favorites.push({
        id: favoriteId,
        user_id: userId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      });
      prop.favorites = (prop.favorites || 0) + 1;
      return res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

export default router;
