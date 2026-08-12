import express from 'express';
import { dbStore } from './dbStore.js';
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
  const userId = req.user.id;

  try {
    const userConvos = dbStore.conversations.filter(c => c.user_id === userId || c.owner_id === userId);
    const formattedConvos = [];

    for (const c of userConvos) {
      // Find seeker & owner profile details
      const seeker = dbStore.profiles.find(u => u.id === c.user_id) || {};
      const owner = dbStore.profiles.find(u => u.id === c.owner_id) || {};
      const property = dbStore.properties.find(p => p.id === c.property_id) || {};

      // Get messages
      const msgs = dbStore.messages.filter(m => m.conversation_id === c.id);

      const isUserSeeker = c.user_id === userId;

      formattedConvos.push({
        id: c.id,
        propertyId: c.property_id,
        propertyName: property.title || 'Nestly Property',
        propertyImage: property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        ownerName: isUserSeeker ? owner.name : seeker.name,
        ownerAvatar: isUserSeeker ? owner.avatar : seeker.avatar,
        messages: msgs.map(m => formatMessage(m, c)),
        unreadCount: 0,
        typing: false
      });
    }

    return res.json({ conversations: formattedConvos });
  } catch (error) {
    console.error('Fetch conversations error:', error);
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

  try {
    // Get property details to find owner
    const prop = dbStore.properties.find(p => p.id === propertyId);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const ownerId = prop.owner_id;

    if (seekerId === ownerId) {
      return res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
    }

    // Check if conversation already exists
    let convo = dbStore.conversations.find(
      c => c.property_id === propertyId && c.user_id === seekerId && c.owner_id === ownerId
    );

    let convoId = convo?.id;

    if (!convoId) {
      convoId = `convo-${Date.now()}`;
      // Create conversation
      convo = {
        id: convoId,
        property_id: propertyId,
        user_id: seekerId,
        owner_id: ownerId,
        created_at: new Date().toISOString()
      };
      dbStore.conversations.push(convo);

      // Create initial greeting message from the owner
      const msgId = `m-${Date.now()}`;
      const greeting = `Hi! Thank you for inquiring about "${prop.title}". How can I help you today?`;
      dbStore.messages.push({
        id: msgId,
        conversation_id: convoId,
        sender_id: ownerId,
        sender_role: 'owner',
        text: greeting,
        created_at: new Date().toISOString()
      });
    }

    const seeker = dbStore.profiles.find(u => u.id === convo.user_id) || {};
    const owner = dbStore.profiles.find(u => u.id === convo.owner_id) || {};
    const property = dbStore.properties.find(p => p.id === convo.property_id) || {};

    const msgs = dbStore.messages.filter(m => m.conversation_id === convoId);

    const formatted = {
      id: convo.id,
      propertyId: convo.property_id,
      propertyName: property.title || 'Nestly Property',
      propertyImage: property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ownerName: owner.name || 'Owner',
      ownerAvatar: owner.avatar || '',
      messages: msgs.map(m => formatMessage(m, convo)),
      unreadCount: 0,
      typing: false
    };

    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error('Start conversation error:', error);
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

  try {
    // Validate conversation
    const convo = dbStore.conversations.find(c => c.id === conversationId);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (convo.user_id !== senderId && convo.owner_id !== senderId) {
      return res.status(403).json({ error: 'You are not a participant in this conversation.' });
    }

    const messageId = `m-${Date.now()}`;
    const senderRole = senderId === convo.owner_id ? 'owner' : 'user';

    const newMsg = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      sender_role: senderRole,
      text,
      created_at: new Date().toISOString()
    };

    // Insert message
    dbStore.messages.push(newMsg);

    const formattedMessage = formatMessage(newMsg, convo);

    // Broadcast to other participant via Socket.io
    const io = req.app.get('socketio');
    const recipientId = senderId === convo.owner_id ? convo.user_id : convo.owner_id;

    if (io) {
      io.to(conversationId).emit('message_received', { conversationId, message: formattedMessage });
      io.to(recipientId).emit('message_notification', {
        conversationId,
        message: formattedMessage,
        title: `New Message from ${senderId === convo.owner_id ? 'Owner' : 'Seeker'}`,
        text: text.length > 60 ? `${text.substr(0, 60)}...` : text
      });
    }

    // --- Backend Automated AI Owner Reply Logic ---
    if (senderRole === 'user') {
      const ownerProfile = dbStore.profiles.find(u => u.id === convo.owner_id);
      const ownerName = ownerProfile?.name || 'Owner';

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
        try {
          const autoMsgId = `m-auto-${Date.now()}`;
          const autoMsg = {
            id: autoMsgId,
            conversation_id: conversationId,
            sender_id: convo.owner_id,
            sender_role: 'owner',
            text: replyText,
            created_at: new Date().toISOString()
          };
          dbStore.messages.push(autoMsg);

          const autoFormatted = formatMessage(autoMsg, convo);

          // Add notification for the seeker
          const notifId = `notif-${Date.now()}`;
          dbStore.notifications.push({
            id: notifId,
            user_id: convo.user_id,
            type: 'chat',
            title: `Message from ${ownerName}`,
            message: replyText,
            read: 0,
            created_at: new Date().toISOString()
          });

          if (io) {
            io.to(conversationId).emit('typing_status', { conversationId, typing: false });
            io.to(conversationId).emit('message_received', { conversationId, message: autoFormatted });
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
        }
      }, 2000);

      // Trigger typing indicator on socket after 700ms
      setTimeout(() => {
        if (io) {
          io.to(conversationId).emit('typing_status', { conversationId, typing: true });
        }
      }, 700);
    }

    return res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
