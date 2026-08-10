import express from 'express';
import { getDbConnection } from './database.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// 1. GET user's notifications
router.get('/', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  const userId = req.user.id;

  try {
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const formatted = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: Boolean(n.read),
      date: n.created_at
    }));

    await db.close();
    return res.json({ notifications: formatted });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// 2. POST Mark all notifications as read
router.post('/read', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  const userId = req.user.id;

  try {
    await db.run('UPDATE notifications SET read = 1 WHERE user_id = ?', [userId]);
    await db.close();
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark read notifications error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// 3. POST Clear all notifications
router.post('/clear', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  const userId = req.user.id;

  try {
    await db.run('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await db.close();
    return res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
