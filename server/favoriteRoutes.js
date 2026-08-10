import express from 'express';
import { getDbConnection } from './database.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// 1. GET user's favorites (returns array of propertyIds)
router.get('/', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  try {
    const favorites = await db.all('SELECT property_id FROM favorites WHERE user_id = ?', [req.user.id]);
    await db.close();
    return res.json({ favorites: favorites.map(f => f.property_id) });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to retrieve favorites.' });
  }
});

// 2. POST Toggle favorite for a property
router.post('/:id', authenticateToken, async (req, res) => {
  const propertyId = req.params.id;
  const userId = req.user.id;
  const db = await getDbConnection();

  try {
    // Check if property exists
    const prop = await db.get('SELECT id FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    // Check if already favorited
    const existing = await db.get('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);

    if (existing) {
      // Remove favorite
      await db.run('DELETE FROM favorites WHERE id = ?', [existing.id]);
      await db.run('UPDATE properties SET favorites = MAX(0, favorites - 1) WHERE id = ?', [propertyId]);
      await db.close();
      return res.json({ favorited: false });
    } else {
      // Add favorite
      const favoriteId = `fav-${Date.now()}`;
      await db.run(
        'INSERT INTO favorites (id, user_id, property_id) VALUES (?, ?, ?)',
        [favoriteId, userId, propertyId]
      );
      await db.run('UPDATE properties SET favorites = favorites + 1 WHERE id = ?', [propertyId]);
      await db.close();
      return res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

export default router;
