import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';

// Route Imports
import authRoutes from './authRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS config
app.use(cors({
  origin: '*', // Allow all origins for local hackathon development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Set up port
const PORT = process.env.PORT || 5000;

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({ message: 'Nestly Local Backend API is running successfully.' });
});

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store io instance on app to make it accessible inside routes
app.set('socketio', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a client enters a specific chat conversation
  socket.on('join_conversation', (convoId) => {
    socket.join(convoId);
    console.log(`Socket ${socket.id} joined conversation: ${convoId}`);
  });

  // When a user logs in, join their unique user room to receive private notifications
  socket.on('join_user', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user channel: ${userId}`);
  });

  // Handle typing indicator trigger
  socket.on('typing_status_change', ({ conversationId, typing }) => {
    socket.to(conversationId).emit('typing_status', { conversationId, typing });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Initialize database then start server
initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Nestly Backend listening on port ${PORT}`);
      console.log(`⚙️  API Endpoint base: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database. Server cannot start.', error);
    process.exit(1);
  });
