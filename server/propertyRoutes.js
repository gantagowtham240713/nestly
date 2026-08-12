import express from 'express';
import { dbStore } from './dbStore.js';
import { authenticateToken, optionalAuthenticateToken } from './authMiddleware.js';

const router = express.Router();

// Helper to format in-memory database rows to frontend camelCase format
function formatProperty(row, images = [], verifications = []) {
  // Find owner from profiles
  const owner = dbStore.profiles.find(u => u.id === row.owner_id) || {};

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    purpose: row.purpose,
    propertyType: row.property_type,
    price: Number(row.price),
    city: row.city,
    locality: row.locality,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    bhk: Number(row.bhk),
    bathrooms: Number(row.bathrooms),
    area: Number(row.area),
    furnishing: row.furnishing,
    parking: Boolean(row.parking),
    gym: Boolean(row.gym),
    balcony: Boolean(row.balcony),
    petFriendly: Boolean(row.pet_friendly),
    gatedCommunity: Boolean(row.gated_community),
    bachelorFriendly: Boolean(row.bachelor_friendly),
    availability: row.availability,
    verifiedOwner: Boolean(row.verified_owner),
    verifiedProperty: Boolean(row.verified_property),
    distanceToMetro: row.distance_to_metro ? Number(row.distance_to_metro) : null,
    nearbyMetroStation: row.nearby_metro_station || null,
    distanceToSchool: row.distance_to_school ? Number(row.distance_to_school) : null,
    nearbySchool: row.nearby_school || null,
    distanceToHospital: row.distance_to_hospital ? Number(row.distance_to_hospital) : null,
    nearbyHospital: row.nearby_hospital || null,
    views: Number(row.views || 0),
    favorites: Number(row.favorites || 0),
    inquiries: Number(row.inquiries || 0),
    creationDate: row.created_at,
    owner: {
      id: owner.id || row.owner_id,
      name: owner.name || 'Unknown Owner',
      phone: owner.phone || '',
      email: owner.email || '',
      avatar: owner.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=owner',
      role: owner.role || 'owner',
      verified: owner.verification_status === 'verified'
    },
    images: images || [],
    documents: verifications.map(v => ({
      name: v.document_name,
      status: v.status
    })),
    priceHistory: [
      { month: 'Jan', price: Math.round(Number(row.price) * 0.9) },
      { month: 'Mar', price: Math.round(Number(row.price) * 0.93) },
      { month: 'May', price: Math.round(Number(row.price) * 0.97) },
      { month: 'Jul', price: Number(row.price) }
    ]
  };
}

// 1. GET all properties (support search, filtering)
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const { purpose, city, locality, type, minPrice, maxPrice, bhk } = req.query;

    let data = [...dbStore.properties];

    if (purpose) {
      data = data.filter(p => p.purpose === purpose);
    }
    if (city) {
      data = data.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (locality) {
      data = data.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase()));
    }
    if (type) {
      data = data.filter(p => p.property_type === type);
    }
    if (minPrice) {
      data = data.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      data = data.filter(p => p.price <= Number(maxPrice));
    }
    if (bhk) {
      data = data.filter(p => p.bhk === Number(bhk));
    }

    const formattedProperties = data.map(p => {
      const verifications = dbStore.propertyVerifications.filter(v => v.property_id === p.id);
      return formatProperty(p, p.images || [], verifications);
    });

    return res.json({ properties: formattedProperties });
  } catch (error) {
    console.error('Fetch properties error:', error);
    return res.status(500).json({ error: 'Failed to retrieve properties.' });
  }
});

// 2. GET property by ID
router.get('/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = dbStore.properties.find(p => p.id === propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    // Increment view count
    property.views = (property.views || 0) + 1;

    const verifications = dbStore.propertyVerifications.filter(v => v.property_id === propertyId);
    const formatted = formatProperty(property, property.images || [], verifications);
    
    return res.json({ property: formatted });
  } catch (error) {
    console.error('Fetch property by id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve property details.' });
  }
});

// 3. POST Create property listing
router.post('/', authenticateToken, async (req, res) => {
  const prop = req.body;

  try {
    const propertyId = `prop-${Date.now()}`;
    const ownerId = req.user.id;

    const imagesList = prop.images && prop.images.length > 0
      ? prop.images
      : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];

    const docs = prop.documents || [{ name: 'Title Deed', status: 'pending' }, { name: 'Tax Receipt', status: 'pending' }];
    const localVerifications = docs.map(d => ({
      id: `v-${propertyId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      property_id: propertyId,
      document_name: d.name,
      status: d.status || 'pending'
    }));

    dbStore.propertyVerifications.push(...localVerifications);

    const newProp = {
      id: propertyId,
      title: prop.title,
      description: prop.description,
      purpose: prop.purpose,
      property_type: prop.propertyType,
      price: Number(prop.price),
      city: prop.city,
      locality: prop.locality,
      latitude: Number(prop.latitude || 17.3850),
      longitude: Number(prop.longitude || 78.4867),
      bhk: Number(prop.bhk),
      bathrooms: Number(prop.bathrooms || 1),
      area: Number(prop.area),
      furnishing: prop.furnishing || 'unfurnished',
      parking: prop.parking ? 1 : 0,
      gym: prop.gym ? 1 : 0,
      balcony: prop.balcony ? 1 : 0,
      pet_friendly: prop.petFriendly ? 1 : 0,
      gated_community: prop.gatedCommunity ? 1 : 0,
      bachelor_friendly: prop.bachelorFriendly ? 1 : 0,
      availability: 'available',
      verified_owner: req.user.role === 'admin' ? 1 : 0,
      verified_property: req.user.role === 'admin' ? 1 : 0,
      owner_id: ownerId,
      distance_to_metro: prop.distance_to_metro ? Number(prop.distance_to_metro) : null,
      nearby_metro_station: prop.nearbyMetroStation || null,
      distance_to_school: prop.distance_to_school ? Number(prop.distance_to_school) : null,
      nearby_school: prop.nearby_school || null,
      distance_to_hospital: prop.distance_to_hospital ? Number(prop.distance_to_hospital) : null,
      nearby_hospital: prop.nearby_hospital || null,
      views: 0,
      favorites: 0,
      inquiries: 0,
      images: imagesList,
      created_at: new Date().toISOString()
    };

    dbStore.properties.unshift(newProp);

    // Create system notification for verification status
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: ownerId,
      type: 'system',
      title: 'Listing Pending Approval',
      message: `Your property "${prop.title}" has been uploaded and is in the verification queue.`,
      read: 0,
      created_at: new Date().toISOString()
    });

    const formatted = formatProperty(newProp, newProp.images, localVerifications);
    return res.status(201).json({ property: formatted });
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ error: 'Failed to submit property listing.' });
  }
});

// 4. DELETE Property listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const propIndex = dbStore.properties.findIndex(p => p.id === propertyId);

    if (propIndex === -1) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const prop = dbStore.properties[propIndex];
    if (prop.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
    }

    dbStore.properties.splice(propIndex, 1);
    return res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ error: 'Failed to delete property listing.' });
  }
});

// 5. POST Verify Property (Admin Only)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const propertyId = req.params.id;
    const prop = dbStore.properties.find(p => p.id === propertyId);

    if (!prop) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    prop.verified_property = 1;

    dbStore.propertyVerifications
      .filter(v => v.property_id === propertyId)
      .forEach(v => v.status = 'verified');

    // Send notification to owner
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: prop.owner_id,
      type: 'system',
      title: 'Listing Verified! 🎉',
      message: `Your property "${prop.title}" has been successfully verified by an admin.`,
      read: 0,
      created_at: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Property and documents verified.' });
  } catch (error) {
    console.error('Verify property error:', error);
    return res.status(500).json({ error: 'Failed to verify property.' });
  }
});

// 6. POST Verify Owner (Admin Only)
router.post('/:id/verify-owner', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const propertyId = req.params.id;
    const prop = dbStore.properties.find(p => p.id === propertyId);

    if (!prop) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    prop.verified_owner = 1;
    const owner = dbStore.profiles.find(u => u.id === prop.owner_id);
    if (owner) {
      owner.verification_status = 'verified';
    }

    return res.json({ success: true, message: 'Owner identity verified successfully.' });
  } catch (error) {
    console.error('Verify owner error:', error);
    return res.status(500).json({ error: 'Failed to verify owner.' });
  }
});

// 7. POST Mark property as sold or rented
router.post('/:id/status', authenticateToken, async (req, res) => {
  const { availability } = req.body;
  if (!availability || !['available', 'rented', 'sold'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability status.' });
  }

  try {
    const propertyId = req.params.id;
    const prop = dbStore.properties.find(p => p.id === propertyId);

    if (!prop) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (prop.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to change listing status.' });
    }

    prop.availability = availability;

    // Send notification to owner
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: prop.owner_id,
      type: 'system',
      title: `Property ${availability.toUpperCase()}`,
      message: `Your property "${prop.title}" is marked as ${availability}.`,
      read: 0,
      created_at: new Date().toISOString()
    });

    return res.json({ success: true, availability });
  } catch (error) {
    console.error('Change status error:', error);
    return res.status(500).json({ error: 'Failed to update property status.' });
  }
});

export default router;
