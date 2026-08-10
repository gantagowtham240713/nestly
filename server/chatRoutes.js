import express from 'express';
import { getDbConnection } from './database.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// Helper to format messages
function formatMessage(msg, convo) {
  return {
    id: msg.id,
    sender: msg.sender_id === convo.owner_id ? 'owner' : 'user',
    text: msg.text,
    imageUrl: msg.image_url || null,
    timestamp: msg.created_at
  };
}

// 1. GET User's Conversations
router.get('/', authenticateToken, async (req, res) => {
  const db = await getDbConnection();
  const userId = req.user.id;

  try {
    const convos = await db.all(`
      SELECT c.*, 
             p.title as property_title,
             seeker.name as seeker_name, seeker.avatar as seeker_avatar,
             owner.name as owner_name, owner.avatar as owner_avatar
      FROM conversations c
      JOIN properties p ON c.property_id = p.id
      JOIN profiles seeker ON c.user_id = seeker.id
      JOIN profiles owner ON c.owner_id = owner.id
      WHERE c.user_id = ? OR c.owner_id = ?
      ORDER BY c.created_at DESC
    `, [userId, userId]);

    const formattedConvos = [];

    for (const c of convos) {
      // Get messages
      const msgs = await db.all('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [c.id]);
      
      // Get property image
      const img = await db.get('SELECT image_url FROM property_images WHERE property_id = ? ORDER BY display_order LIMIT 1', [c.property_id]);
      
      // Decide other participant's details
      const isUserSeeker = c.user_id === userId;
      
      formattedConvos.push({
        id: c.id,
        propertyId: c.property_id,
        propertyName: c.property_title,
        propertyImage: img ? img.image_url : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        
        // Frontend uses ownerName and ownerAvatar to display the chat contact's info.
        // We set these to the other user's info so it renders correctly for both sides.
        ownerName: isUserSeeker ? c.owner_name : c.seeker_name,
        ownerAvatar: isUserSeeker ? c.owner_avatar : c.seeker_avatar,
        
        messages: msgs.map(m => formatMessage(m, c)),
        unreadCount: 0,
        typing: false
      });
    }

    await db.close();
    return res.json({ conversations: formattedConvos });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// 2. POST Start or Retrieve Conversation
router.post('/', authenticateToken, async (req, res) => {
  const { propertyId } = req.body;
  const seekerId = req.user.id;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required.' });
  }

  const db = await getDbConnection();

  try {
    // Get property details to find owner
    const prop = await db.get('SELECT title, owner_id FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    const ownerId = prop.owner_id;

    if (seekerId === ownerId) {
      await db.close();
      return res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
    }

    // Check if conversation already exists
    let convo = await db.get(
      'SELECT id FROM conversations WHERE property_id = ? AND user_id = ? AND owner_id = ?',
      [propertyId, seekerId, ownerId]
    );

    let convoId = convo?.id;

    if (!convoId) {
      convoId = `convo-${Date.now()}`;
      // Create conversation
      await db.run(
        'INSERT INTO conversations (id, property_id, user_id, owner_id) VALUES (?, ?, ?, ?)',
        [convoId, propertyId, seekerId, ownerId]
      );

      // Create initial greeting message from the owner
      const msgId = `m-${Date.now()}`;
      const greeting = `Hi! Thank you for inquiring about "${prop.title}". How can I help you today?`;
      await db.run(
        'INSERT INTO messages (id, conversation_id, sender_id, sender_role, text) VALUES (?, ?, ?, ?, ?)',
        [msgId, convoId, ownerId, 'owner', greeting]
      );
    }

    // Load full conversation details
    const fullConvo = await db.get(`
      SELECT c.*, 
             p.title as property_title,
             seeker.name as seeker_name, seeker.avatar as seeker_avatar,
             owner.name as owner_name, owner.avatar as owner_avatar
      FROM conversations c
      JOIN properties p ON c.property_id = p.id
      JOIN profiles seeker ON c.user_id = seeker.id
      JOIN profiles owner ON c.owner_id = owner.id
      WHERE c.id = ?
    `, [convoId]);

    const msgs = await db.all('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [convoId]);
    const img = await db.get('SELECT image_url FROM property_images WHERE property_id = ? ORDER BY display_order LIMIT 1', [propertyId]);

    const formatted = {
      id: fullConvo.id,
      propertyId: fullConvo.property_id,
      propertyName: fullConvo.property_title,
      propertyImage: img ? img.image_url : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ownerName: fullConvo.owner_name, // Starting is always seeker's perspective
      ownerAvatar: fullConvo.owner_avatar,
      messages: msgs.map(m => formatMessage(m, fullConvo)),
      unreadCount: 0,
      typing: false
    };

    await db.close();
    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error('Start conversation error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to start conversation.' });
  }
});

// 3. POST Send Message in Conversation (also handles automated replies)
router.post('/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  const { text } = req.body;
  const senderId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const db = await getDbConnection();

  try {
    // Validate conversation
    const convo = await db.get('SELECT * FROM conversations WHERE id = ?', [conversationId]);
    if (!convo) {
      await db.close();
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (convo.user_id !== senderId && convo.owner_id !== senderId) {
      await db.close();
      return res.status(403).json({ error: 'You are not a participant in this conversation.' });
    }

    const messageId = `m-${Date.now()}`;
    const senderRole = senderId === convo.owner_id ? 'owner' : 'user';

    // Insert message
    await db.run(
      'INSERT INTO messages (id, conversation_id, sender_id, sender_role, text) VALUES (?, ?, ?, ?, ?)',
      [messageId, conversationId, senderId, senderRole, text]
    );

    // Get the inserted message details
    const msg = await db.get('SELECT * FROM messages WHERE id = ?', [messageId]);
    const formattedMessage = formatMessage(msg, convo);

    // Broadcast to other participant via Socket.io
    const io = req.app.get('socketio');
    const recipientId = senderId === convo.owner_id ? convo.user_id : convo.owner_id;

    if (io) {
      // Emit to conversation room and to user's personal channel
      io.to(conversationId).emit('message_received', { conversationId, message: formattedMessage });
      io.to(recipientId).emit('message_notification', {
        conversationId,
        message: formattedMessage,
        title: `New Message from ${senderId === convo.owner_id ? 'Owner' : 'Seeker'}`,
        text: text.length > 60 ? `${text.substr(0, 60)}...` : text
      });
    }

    // --- Backend Automated AI Owner Reply Logic ---
    // If the sender is the seeker (user) and the recipient is an owner, schedule reply
    if (senderRole === 'user') {
      const ownerProfile = await db.get('SELECT name FROM profiles WHERE id = ?', [convo.owner_id]);
      const property = await db.get('SELECT title FROM properties WHERE id = ?', [convo.property_id]);
      
      const ownerName = ownerProfile?.name || 'Owner';
      const propertyName = property?.title || 'the property';

      // Pick reply text based on keywords
      let replyText = "Thank you for the message. I will check my schedule and get back to you shortly.";
      const cleanMsg = text.toLowerCase();

      if (cleanMsg.includes('visit') || cleanMsg.includes('see') || cleanMsg.includes('view') || cleanMsg.includes('look')) {
        replyText = `Sure! I am available this weekend (Saturday/Sunday) between 10 AM and 4 PM. Does that work for you?`;
      } else if (cleanMsg.includes('rent') || cleanMsg.includes('price') || cleanMsg.includes('negotiable') || cleanMsg.includes('cost')) {
        replyText = `The price is slightly negotiable for long-term tenants. Let's schedule a call or meet up to discuss details.`;
      } else if (cleanMsg.includes('pet') || cleanMsg.includes('dog') || cleanMsg.includes('cat')) {
        replyText = `Yes, pets are absolutely allowed in the society. There are no restrictions.`;
      } else if (cleanMsg.includes('park') || cleanMsg.includes('car') || cleanMsg.includes('garage')) {
        replyText = `Yes, there is dedicated parking available. One covered spot is reserved for this unit.`;
      }

      // Trigger reply after 2 seconds
      setTimeout(async () => {
        const autoDb = await getDbConnection();
        try {
          const autoMsgId = `m-auto-${Date.now()}`;
          await autoDb.run(
            'INSERT INTO messages (id, conversation_id, sender_id, sender_role, text) VALUES (?, ?, ?, ?, ?)',
            [autoMsgId, conversationId, convo.owner_id, 'owner', replyText]
          );

          const autoMsg = await autoDb.get('SELECT * FROM messages WHERE id = ?', [autoMsgId]);
          const autoFormatted = formatMessage(autoMsg, convo);

          // Add notification for the seeker
          const notifId = `notif-${Date.now()}`;
          await autoDb.run(
            `INSERT INTO notifications (id, user_id, type, title, message, read)
             VALUES (?, ?, 'chat', ?, ?, 0)`,
            [notifId, convo.user_id, `Message from ${ownerName}`, replyText]
          );

          if (io) {
            // Send typing stopped event
            io.to(conversationId).emit('typing_status', { conversationId, typing: false });

            // Send new message
            io.to(conversationId).emit('message_received', { conversationId, message: autoFormatted });

            // Send notification event
            io.to(convo.user_id).emit('notification_received', {
              id: notifId,
              type: 'chat',
              title: `Message from ${ownerName}`,
              message: replyText,
              date: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error generating automated reply:', err);
        } finally {
          await autoDb.close();
        }
      }, 2000);

      // Trigger typing indicator on socket after 700ms
      setTimeout(() => {
        if (io) {
          io.to(conversationId).emit('typing_status', { conversationId, typing: true });
        }
      }, 700);
    }

    await db.close();
    return res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
