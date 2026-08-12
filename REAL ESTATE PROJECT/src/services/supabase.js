import { supabase } from './supabaseClient';

// Helper to format Supabase database rows to frontend camelCase format
function formatProperty(prop) {
  if (!prop) return null;
  const owner = prop.owner || {};
  const images = prop.property_images 
    ? prop.property_images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(img => img.image_url)
    : [];
  const documents = prop.property_verifications
    ? prop.property_verifications.map(v => ({ name: v.document_name, status: v.status }))
    : [];

  return {
    id: prop.id,
    title: prop.title,
    description: prop.description,
    purpose: prop.purpose,
    propertyType: prop.property_type,
    price: Number(prop.price),
    city: prop.city,
    locality: prop.locality,
    latitude: Number(prop.latitude),
    longitude: Number(prop.longitude),
    bhk: Number(prop.bhk),
    bathrooms: Number(prop.bathrooms),
    area: Number(prop.area),
    furnishing: prop.furnishing,
    parking: Boolean(prop.parking),
    gym: Boolean(prop.gym),
    balcony: Boolean(prop.balcony),
    petFriendly: Boolean(prop.pet_friendly),
    gatedCommunity: Boolean(prop.gated_community),
    bachelorFriendly: Boolean(prop.bachelor_friendly),
    availability: prop.availability,
    verifiedOwner: Boolean(prop.verified_owner),
    verifiedProperty: Boolean(prop.verified_property),
    distanceToMetro: prop.distance_to_metro ? Number(prop.distance_to_metro) : null,
    nearbyMetroStation: prop.nearby_metro_station || null,
    distanceToSchool: prop.distance_to_school ? Number(prop.distance_to_school) : null,
    nearbySchool: prop.nearby_school || null,
    distanceToHospital: prop.distance_to_hospital ? Number(prop.distance_to_hospital) : null,
    nearbyHospital: prop.nearby_hospital || null,
    views: Number(prop.views || 0),
    favorites: Number(prop.favorites || 0),
    inquiries: Number(prop.inquiries || 0),
    creationDate: prop.created_at,
    owner: {
      id: owner.id || prop.owner_id,
      name: owner.name || 'Unknown Owner',
      phone: owner.phone || '',
      email: owner.email || '',
      avatar: owner.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=owner',
      role: owner.role || 'owner',
      verified: owner.verification_status === 'verified'
    },
    images,
    documents,
    priceHistory: [
      { month: 'Jan', price: Math.round(Number(prop.price) * 0.9) },
      { month: 'Mar', price: Math.round(Number(prop.price) * 0.93) },
      { month: 'May', price: Math.round(Number(prop.price) * 0.97) },
      { month: 'Jul', price: Number(prop.price) }
    ]
  };
}

export const dbService = {
  // 1. Fetch properties (supports queries/filters)
  async fetchProperties(filters = {}) {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles(*),
          property_images(image_url, display_order),
          property_verifications(document_name, status)
        `)
        .order('created_at', { ascending: false });

      if (filters.purpose) {
        query = query.eq('purpose', filters.purpose);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.locality) {
        query = query.ilike('locality', `%${filters.locality}%`);
      }
      if (filters.type) {
        query = query.eq('property_type', filters.type);
      }
      if (filters.minPrice) {
        query = query.gte('price', Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', Number(filters.maxPrice));
      }
      if (filters.bhk) {
        query = query.eq('bhk', Number(filters.bhk));
      }

      const { data, error } = await query;
      if (error) {
        console.error('fetchProperties error:', error);
        return { data: [], error: error.message || 'Failed to fetch properties.' };
      }
      return { data: (data || []).map(formatProperty), error: null };
    } catch (error) {
      console.error('dbService.fetchProperties exception:', error);
      return { data: [], error: 'Failed to communicate with database.' };
    }
  },

  // 2. Fetch single property details
  async fetchProperty(id) {
    try {
      // Increment view count
      const { data: currentProp } = await supabase
        .from('properties')
        .select('views')
        .eq('id', id)
        .maybeSingle();

      if (currentProp) {
        await supabase
          .from('properties')
          .update({ views: (currentProp.views || 0) + 1 })
          .eq('id', id);
      }

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles(*),
          property_images(image_url, display_order),
          property_verifications(document_name, status)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) return { data: null, error: error.message || 'Failed to fetch property details.' };
      return { data: formatProperty(data), error: null };
    } catch (error) {
      return { data: null, error: 'Database communication error.' };
    }
  },

  // 3. Create property listing
  async createProperty(property) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const ownerId = session?.user?.id || null;

      const dbProperty = {
        title: property.title,
        description: property.description,
        purpose: property.purpose,
        property_type: property.propertyType,
        price: Number(property.price),
        city: property.city,
        locality: property.locality,
        latitude: Number(property.latitude),
        longitude: Number(property.longitude),
        bhk: Number(property.bhk),
        bathrooms: Number(property.bathrooms),
        area: Number(property.area),
        furnishing: property.furnishing || 'unfurnished',
        parking: Boolean(property.parking),
        gym: Boolean(property.gym),
        balcony: Boolean(property.balcony),
        pet_friendly: Boolean(property.petFriendly),
        gated_community: Boolean(property.gatedCommunity),
        bachelor_friendly: Boolean(property.bachelorFriendly),
        availability: property.availability || 'available',
        verified_owner: false,
        verified_property: false,
        owner_id: ownerId,
        distance_to_metro: property.distanceToMetro ? Number(property.distanceToMetro) : null,
        nearby_metro_station: property.nearbyMetroStation || null,
        distance_to_school: property.distanceToSchool ? Number(property.distanceToSchool) : null,
        nearby_school: property.nearbySchool || null,
        distance_to_hospital: property.distanceToHospital ? Number(property.distanceToHospital) : null,
        nearby_hospital: property.nearbyHospital || null,
        views: 0,
        favorites: 0,
        inquiries: 0
      };

      const { data: newProp, error: propErr } = await supabase
        .from('properties')
        .insert(dbProperty)
        .select()
        .single();

      if (propErr) return { data: null, error: propErr.message || 'Failed to create listing.' };

      // Insert images
      if (property.images && property.images.length > 0) {
        const dbImages = property.images.map((url, idx) => ({
          property_id: newProp.id,
          image_url: url,
          display_order: idx
        }));
        await supabase.from('property_images').insert(dbImages);
      }

      // Insert verification document placeholders
      const docName = property.governmentId || 'Title Deed.pdf';
      await supabase.from('property_verifications').insert({
        property_id: newProp.id,
        document_name: docName,
        document_url: 'https://placeholder.com/doc.pdf',
        status: 'pending'
      });

      return this.fetchProperty(newProp.id);
    } catch (error) {
      console.error('createProperty error:', error);
      return { data: null, error: 'Failed to create property listing.' };
    }
  },

  // 4. Delete property listing
  async deleteProperty(propertyId) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  },

  // 5. Fetch user's favorite property IDs
  async fetchFavorites() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: [], error: null };

      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', session.user.id);

      if (error) return { data: [], error: error.message || 'Failed to fetch favorites.' };
      return { data: (data || []).map(f => f.property_id), error: null };
    } catch (error) {
      return { data: [], error: 'Database communication error.' };
    }
  },

  // 6. Toggle favorite
  async toggleFavorite(propertyId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { favorited: null, error: 'User not logged in' };

      // Check if it already exists
      const { data: existingFav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existingFav) {
        // Remove it
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFav.id);
        
        if (error) return { favorited: null, error: error.message };
        
        // Update property favorites count
        const { data: currentProp } = await supabase.from('properties').select('favorites').eq('id', propertyId).maybeSingle();
        if (currentProp) {
          await supabase.from('properties').update({ favorites: Math.max(0, (currentProp.favorites || 0) - 1) }).eq('id', propertyId);
        }

        return { favorited: false, error: null };
      } else {
        // Add it
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: session.user.id,
            property_id: propertyId
          });

        if (error) return { favorited: null, error: error.message };

        // Update property favorites count
        const { data: currentProp } = await supabase.from('properties').select('favorites').eq('id', propertyId).maybeSingle();
        if (currentProp) {
          await supabase.from('properties').update({ favorites: (currentProp.favorites || 0) + 1 }).eq('id', propertyId);
        }

        return { favorited: true, error: null };
      }
    } catch (error) {
      return { favorited: null, error: 'Database communication error.' };
    }
  },

  // 7. Fetch user's conversations
  async fetchConversations() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: [], error: null };

      // Fetch conversations where user is seeker or owner
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          property:properties(*),
          user:profiles!user_id(*),
          owner:profiles!owner_id(*),
          messages(*)
        `)
        .or(`user_id.eq.${session.user.id},owner_id.eq.${session.user.id}`);

      if (error) return { data: [], error: error.message || 'Failed to fetch conversations.' };

      const formatted = (data || []).map(convo => {
        const property = convo.property || {};
        const isUserSeeker = convo.user_id === session.user.id;
        const otherUser = isUserSeeker ? (convo.owner || {}) : (convo.user || {});
        
        const msgs = convo.messages
          ? convo.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(m => ({
              id: m.id,
              sender_id: m.sender_id,
              sender: m.sender_id === convo.owner_id ? 'owner' : 'user',
              text: m.text,
              imageUrl: m.image_url || null,
              timestamp: m.created_at
            }))
          : [];

        return {
          id: convo.id,
          propertyId: convo.property_id,
          propertyName: property.title || 'Nestly Property',
          propertyImage: (property.property_images && property.property_images[0]?.image_url) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          ownerName: otherUser.name || 'User',
          ownerAvatar: otherUser.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar',
          messages: msgs,
          unreadCount: 0,
          typing: false
        };
      });

      return { data: formatted, error: null };
    } catch (error) {
      return { data: [], error: 'Database communication error.' };
    }
  },

  // 8. Start conversation
  async startConversation(propertyId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: null, error: 'User not logged in' };

      const { data: prop } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();

      if (!prop) return { data: null, error: 'Property not found' };

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('user_id', session.user.id)
        .eq('owner_id', prop.owner_id)
        .maybeSingle();

      if (existing) {
        return this.fetchConversationDetails(existing.id);
      }

      // Create conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          property_id: propertyId,
          user_id: session.user.id,
          owner_id: prop.owner_id
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };

      // Increment inquiries on property
      const { data: currentProp } = await supabase.from('properties').select('inquiries').eq('id', propertyId).maybeSingle();
      if (currentProp) {
        await supabase.from('properties').update({ inquiries: (currentProp.inquiries || 0) + 1 }).eq('id', propertyId);
      }

      return this.fetchConversationDetails(newConvo.id);
    } catch (error) {
      return { data: null, error: 'Database communication error.' };
    }
  },

  // Helper: Fetch conversation details
  async fetchConversationDetails(convoId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          property:properties(*),
          user:profiles!user_id(*),
          owner:profiles!owner_id(*),
          messages(*)
        `)
        .eq('id', convoId)
        .single();

      if (error) return { data: null, error: error.message };

      const property = data.property || {};
      const { data: { session } } = await supabase.auth.getSession();
      const isUserSeeker = data.user_id === session?.user?.id;
      const otherUser = isUserSeeker ? (data.owner || {}) : (data.user || {});
      
      const msgs = data.messages
        ? data.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(m => ({
            id: m.id,
            sender_id: m.sender_id,
            sender: m.sender_id === data.owner_id ? 'owner' : 'user',
            text: m.text,
            imageUrl: m.image_url || null,
            timestamp: m.created_at
          }))
        : [];

      const formatted = {
        id: data.id,
        propertyId: data.property_id,
        propertyName: property.title || 'Nestly Property',
        propertyImage: (property.property_images && property.property_images[0]?.image_url) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        ownerName: otherUser.name || 'User',
        ownerAvatar: otherUser.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar',
        messages: msgs,
        unreadCount: 0,
        typing: false
      };

      return { data: formatted, error: null };
    } catch (error) {
      return { data: null, error: 'Database communication error.' };
    }
  },

  // 9. Send message
  async sendMessage(convoId, text) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: null, error: 'User not logged in' };

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convoId,
          sender_id: session.user.id,
          text
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };

      const { data: convo } = await supabase.from('conversations').select('owner_id').eq('id', convoId).single();
      const sender = convo && convo.owner_id === session.user.id ? 'owner' : 'user';

      const formatted = {
        id: data.id,
        sender_id: data.sender_id,
        sender,
        text: data.text,
        imageUrl: data.image_url || null,
        timestamp: data.created_at
      };

      return { data: formatted, error: null };
    } catch (error) {
      return { data: null, error: 'Database communication error.' };
    }
  },

  // 10. Fetch user's notifications
  async fetchNotifications() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: [], error: null };

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message || 'Failed to fetch notifications.' };
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: 'Database communication error.' };
    }
  },

  // 11. Mark all notifications as read
  async markNotificationsRead() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { error: 'User not logged in' };

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id);

      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  },

  // 12. Clear all notifications
  async clearNotifications() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { error: 'User not logged in' };

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.user.id);

      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  },

  // 13. Verify Listing (Admin only)
  async verifyPropertyListing(propertyId) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ verified_property: true })
        .eq('id', propertyId);
      
      if (error) return { error: error.message };

      await supabase
        .from('property_verifications')
        .update({ status: 'verified' })
        .eq('property_id', propertyId);

      return { error: null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  },

  // 14. Verify Owner (Admin only)
  async verifyOwnerListing(propertyId) {
    try {
      const { data: prop } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single();
      if (prop && prop.owner_id) {
        const { error } = await supabase
          .from('profiles')
          .update({ verification_status: 'verified' })
          .eq('id', prop.owner_id);
        
        if (error) return { error: error.message };

        await supabase
          .from('properties')
          .update({ verified_owner: true })
          .eq('owner_id', prop.owner_id);
      }
      return { error: null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  },

  // 15. Mark as sold/rented
  async markAsSoldOrRented(propertyId, status) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ availability: status })
        .eq('id', propertyId);
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Database communication error.' };
    }
  }
};
