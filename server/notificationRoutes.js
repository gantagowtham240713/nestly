import express from 'express';
import { dbStore } from './dbStore.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// 1. GET user's notifications
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const userNotifs = dbStore.notifications.filter(n => n.user_id === userId);
    // Sort by created_at desc
    userNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const formatted = userNotifs.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: Boolean(n.read),
      date: n.created_at
    }));

    return res.json({ notifications: formatted });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// 2. POST Mark all notifications as read
router.post('/read', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    dbStore.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => n.read = 1);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark read notifications error:', error);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// 3. POST Clear all notifications
router.post('/clear', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    dbStore.notifications = dbStore.notifications.filter(n => n.user_id !== userId);
    return res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
