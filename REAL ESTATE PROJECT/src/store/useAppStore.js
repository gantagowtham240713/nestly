import { create } from 'zustand';
import { dbService } from '../services/supabase';
import { authService } from '../services/supabaseAuth';
import { io } from 'socket.io-client';

let socket = null;

export const useAppStore = create((set, get) => {
  // Sync state from LocalStorage if available
  const storedUser = localStorage.getItem('hm_session_user');
  const storedRole = localStorage.getItem('hm_role');

  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const initialRole = storedRole ? JSON.parse(storedRole) : (initialUser ? initialUser.role : "user");

  return {
    // Auth & Role state
    userRole: initialRole, // "user" | "owner" | "admin"
    currentUser: initialUser,
    
    // Core database state
    properties: [],
    favorites: [],
    comparedProperties: [],      // Array of Property objects (max 3)
    conversations: [],
    notifications: [],
    savedSearches: [],
    
    // UI active searches
    activeSearchQuery: "",
    parsedPreferences: null,
    activeConvoId: null,

    // Socket actions
    connectSocket: () => {
      const user = get().currentUser;
      if (!user || socket) return;

      socket = io('http://localhost:5000');
      
      // Join user's personal room for notifications
      socket.emit('join_user', user.id);

      // Join all active conversation rooms for real-time messages
      const convos = get().conversations;
      convos.forEach(c => {
        socket.emit('join_conversation', c.id);
      });

      // Listen for real-time messages
      socket.on('message_received', ({ conversationId, message }) => {
        set((state) => {
          const updatedConvos = state.conversations.map(c => {
            if (c.id === conversationId) {
              // Prevent duplicates
              const exists = c.messages.some(m => m.id === message.id);
              if (exists) return c;

              return {
                ...c,
                messages: [...c.messages, message],
                unreadCount: c.id === state.activeConvoId ? 0 : c.unreadCount + 1
              };
            }
            return c;
          });
          return { conversations: updatedConvos };
        });
      });

      // Listen for typing indicator
      socket.on('typing_status', ({ conversationId, typing }) => {
        set((state) => {
          const updatedConvos = state.conversations.map(c => {
            if (c.id === conversationId) {
              return { ...c, typing };
            }
            return c;
          });
          return { conversations: updatedConvos };
        });
      });

      // Listen for notifications
      socket.on('notification_received', (notif) => {
        set((state) => {
          const exists = state.notifications.some(n => n.id === notif.id);
          if (exists) return {};
          return { notifications: [notif, ...state.notifications] };
        });
      });
    },

    disconnectSocket: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    },

    // App Initialization
    initApp: async () => {
      // 1. Fetch properties
      const { data: properties, error: propErr } = await dbService.fetchProperties();
      if (!propErr) {
        set({ properties });
      }

      // 2. Load authenticated session
      const user = await authService.getCurrentSessionUser();
      if (user) {
        set({ currentUser: user, userRole: user.role });

        // Connect real-time sockets
        get().connectSocket();

        // 3. Fetch favorites
        const { data: favorites } = await dbService.fetchFavorites();
        set({ favorites });

        // 4. Fetch conversations
        const { data: conversations } = await dbService.fetchConversations();
        set({ conversations });

        // 5. Fetch notifications
        const { data: notifications } = await dbService.fetchNotifications();
        set({ notifications });
      } else {
        set({ currentUser: null, favorites: [], conversations: [], notifications: [] });
      }
    },

    // Actions
    setRole: (role) => set((state) => {
      localStorage.setItem('hm_role', JSON.stringify(role));
      const updatedUser = state.currentUser ? { ...state.currentUser, role } : null;
      
      // Update profile on backend if logged in
      if (state.currentUser) {
        dbService.completeProperty ? dbService.updateProfile?.(state.currentUser.id, { role }) : null;
      }

      return { userRole: role, currentUser: updatedUser };
    }),

    toggleFavorite: async (propertyId) => {
      if (!get().currentUser) return;

      const { favorited, error } = await dbService.toggleFavorite(propertyId);
      if (error) return;

      set((state) => {
        const isFav = state.favorites.includes(propertyId);
        const updatedFavorites = isFav 
          ? state.favorites.filter(id => id !== propertyId)
          : [...state.favorites, propertyId];

        // Increment/decrement local properties list count
        const updatedProperties = state.properties.map(p => {
          if (p.id === propertyId) {
            return { ...p, favorites: Math.max(0, p.favorites + (favorited ? 1 : -1)) };
          }
          return p;
        });

        return { favorites: updatedFavorites, properties: updatedProperties };
      });
    },

    addComparedProperty: (property) => set((state) => {
      if (state.comparedProperties.find(p => p.id === property.id)) return {};
      if (state.comparedProperties.length >= 3) {
        return { comparedProperties: [...state.comparedProperties.slice(1), property] };
      }
      return { comparedProperties: [...state.comparedProperties, property] };
    }),

    removeComparedProperty: (propertyId) => set((state) => ({
      comparedProperties: state.comparedProperties.filter(p => p.id !== propertyId)
    })),

    clearComparison: () => set({ comparedProperties: [] }),

    // Owner Operations
    addListing: async (property) => {
      const { property: newProperty, error } = await dbService.createProperty(property);
      if (error) return;

      set((state) => {
        const updated = [newProperty, ...state.properties];
        
        // Force refresh notifications since backend created one
        setTimeout(() => get().initApp(), 1000);

        return { properties: updated };
      });
    },

    updateListing: (updatedProperty) => set((state) => {
      const updated = state.properties.map(p => p.id === updatedProperty.id ? { ...p, ...updatedProperty } : p);
      return { properties: updated };
    }),

    deleteListing: async (propertyId) => {
      const { error } = await dbService.deleteProperty(propertyId);
      if (error) return;

      set((state) => {
        const updated = state.properties.filter(p => p.id !== propertyId);
        return { properties: updated };
      });
    },

    // Admin Operations
    verifyPropertyListing: async (propertyId) => {
      const { error } = await dbService.verifyPropertyListing(propertyId);
      if (error) return;

      set((state) => {
        const updated = state.properties.map(p => {
          if (p.id === propertyId) {
            const docs = p.documents.map(d => ({ ...d, status: "verified" }));
            return { ...p, verifiedProperty: true, documents: docs };
          }
          return p;
        });

        setTimeout(() => get().initApp(), 1000); // sync notification

        return { properties: updated };
      });
    },

    verifyOwnerListing: async (propertyId) => {
      const { error } = await dbService.verifyOwnerListing(propertyId);
      if (error) return;

      set((state) => {
        const updated = state.properties.map(p => {
          if (p.id === propertyId) {
            return { ...p, verifiedOwner: true };
          }
          return p;
        });
        return { properties: updated };
      });
    },

    markAsSoldOrRented: async (propertyId) => {
      const targetProp = get().properties.find(p => p.id === propertyId);
      if (!targetProp) return;

      const newAvail = targetProp.purpose === "rent" ? "rented" : "sold";
      const { error } = await dbService.markAsSoldOrRented(propertyId, newAvail);
      if (error) return;

      set((state) => {
        const updated = state.properties.map(p => p.id === propertyId ? { ...p, availability: newAvail } : p);
        setTimeout(() => get().initApp(), 1000); // refresh notifications
        return { properties: updated };
      });
    },

    // Chat Operations
    sendMessage: async (convoId, messageText) => {
      // Trigger typing status on socket instantly
      if (socket) {
        socket.emit('typing_status_change', { conversationId: convoId, typing: false });
      }

      const { data: newMsg, error } = await dbService.sendMessage(convoId, messageText);
      if (error) return;

      set((state) => {
        const updatedConversations = state.conversations.map(c => {
          if (c.id === convoId) {
            const exists = c.messages.some(m => m.id === newMsg.id);
            if (exists) return c;
            return {
              ...c,
              messages: [...c.messages, newMsg],
              unreadCount: 0
            };
          }
          return c;
        });
        return { conversations: updatedConversations };
      });
    },

    startConversation: async (property) => {
      const { data: conversation, error } = await dbService.startConversation(property.id);
      if (error) return;

      set((state) => {
        const exists = state.conversations.find(c => c.id === conversation.id);
        const updated = exists 
          ? state.conversations 
          : [conversation, ...state.conversations];

        // Join the socket room for real-time messages
        if (socket) {
          socket.emit('join_conversation', conversation.id);
        }

        return { 
          conversations: updated, 
          activeConvoId: conversation.id 
        };
      });
    },

    setActiveConvoId: (convoId) => set({ activeConvoId: convoId }),

    // Notifications Operations
    markNotificationsRead: async () => {
      const { error } = await dbService.markNotificationsRead();
      if (error) return;

      set((state) => {
        const updated = state.notifications.map(n => ({ ...n, read: true }));
        return { notifications: updated };
      });
    },

    clearNotifications: async () => {
      const { error } = await dbService.clearNotifications();
      if (error) return;

      set({ notifications: [] });
    },

    // Save Search
    saveSearch: (query, filters) => set((state) => {
      const newSearch = {
        id: `search-${Date.now()}`,
        query,
        filters,
        date: new Date().toISOString()
      };
      const updated = [newSearch, ...state.savedSearches];
      return { savedSearches: updated };
    }),

    // Active Search updates
    setSearchQuery: (query, parsed) => set({
      activeSearchQuery: query,
      parsedPreferences: parsed
    })
  };
});
