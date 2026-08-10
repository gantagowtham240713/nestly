import express from 'express';
import { getDbConnection } from './database.js';
import { authenticateToken, optionalAuthenticateToken } from './authMiddleware.js';

const router = express.Router();

// Helper to format SQLite database rows to frontend camelCase format
function formatProperty(row, images = [], verifications = []) {
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
      id: row.owner_id,
      name: row.owner_name || 'Unknown Owner',
      phone: row.owner_phone || '',
      email: row.owner_email || '',
      avatar: row.owner_avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=owner',
      role: row.owner_role || 'owner',
      verified: row.owner_verification_status === 'verified'
    },
    images: images.map(img => img.image_url),
    documents: verifications.map(v => ({
      name: v.document_name,
      status: v.status
    })),
    // Seed price history dynamically
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
  const db = await getDbConnection();

  try {
    const { purpose, city, locality, type, minPrice, maxPrice, bhk } = req.query;

    let query = `
      SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.avatar as owner_avatar, o.role as owner_role, o.verification_status as owner_verification_status
      FROM properties p
      LEFT JOIN profiles o ON p.owner_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (purpose) {
      query += ` AND p.purpose = ?`;
      params.push(purpose);
    }
    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }
    if (locality) {
      query += ` AND p.locality LIKE ?`;
      params.push(`%${locality}%`);
    }
    if (type) {
      query += ` AND p.property_type = ?`;
      params.push(type);
    }
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }
    if (bhk) {
      query += ` AND p.bhk = ?`;
      params.push(Number(bhk));
    }

    query += ` ORDER BY p.created_at DESC`;

    const properties = await db.all(query, params);
    const allImages = await db.all('SELECT * FROM property_images ORDER BY display_order');
    const allVerifications = await db.all('SELECT * FROM property_verifications');

    const formattedProperties = properties.map(p => {
      const images = allImages.filter(img => img.property_id === p.id);
      const verifications = allVerifications.filter(v => v.property_id === p.id);
      return formatProperty(p, images, verifications);
    });

    await db.close();
    return res.json({ properties: formattedProperties });
  } catch (error) {
    console.error('Fetch properties error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to retrieve properties.' });
  }
});

// 2. GET property by ID
router.get('/:id', async (req, res) => {
  const db = await getDbConnection();

  try {
    const propertyId = req.params.id;

    // Increment view count
    await db.run('UPDATE properties SET views = views + 1 WHERE id = ?', [propertyId]);

    const property = await db.get(`
      SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.avatar as owner_avatar, o.role as owner_role, o.verification_status as owner_verification_status
      FROM properties p
      LEFT JOIN profiles o ON p.owner_id = o.id
      WHERE p.id = ?
    `, [propertyId]);

    if (!property) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    const images = await db.all('SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order', [propertyId]);
    const verifications = await db.all('SELECT * FROM property_verifications WHERE property_id = ?', [propertyId]);

    const formatted = formatProperty(property, images, verifications);
    await db.close();
    return res.json({ property: formatted });
  } catch (error) {
    console.error('Fetch property by id error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to retrieve property details.' });
  }
});

// 3. POST Create property listing
router.post('/', authenticateToken, async (req, res) => {
  const prop = req.body;
  const db = await getDbConnection();

  try {
    const propertyId = `prop-${Date.now()}`;
    const ownerId = req.user.id;

    // Insert property
    await db.run(
      `INSERT INTO properties (
        id, title, description, purpose, property_type, price, city, locality,
        latitude, longitude, bhk, bathrooms, area, furnishing, parking, gym,
        balcony, pet_friendly, gated_community, bachelor_friendly, availability,
        verified_owner, verified_property, owner_id, distance_to_metro, nearby_metro_station,
        distance_to_school, nearby_school, distance_to_hospital, nearby_hospital,
        views, favorites, inquiries
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
      [
        propertyId,
        prop.title,
        prop.description,
        prop.purpose,
        prop.propertyType,
        Number(prop.price),
        prop.city,
        prop.locality,
        Number(prop.latitude || 17.3850), // default to Hyderabad lat
        Number(prop.longitude || 78.4867), // default to Hyderabad lng
        Number(prop.bhk),
        Number(prop.bathrooms || 1),
        Number(prop.area),
        prop.furnishing || 'unfurnished',
        prop.parking ? 1 : 0,
        prop.gym ? 1 : 0,
        prop.balcony ? 1 : 0,
        prop.petFriendly ? 1 : 0,
        prop.gatedCommunity ? 1 : 0,
        prop.bachelorFriendly ? 1 : 0,
        'available',
        req.user.role === 'admin' ? 1 : 0, // Admin listings are auto verified
        req.user.role === 'admin' ? 1 : 0,
        ownerId,
        prop.distanceToMetro ? Number(prop.distanceToMetro) : null,
        prop.nearbyMetroStation || null,
        prop.distanceToSchool ? Number(prop.distanceToSchool) : null,
        prop.nearbySchool || null,
        prop.distanceToHospital ? Number(prop.distanceToHospital) : null,
        prop.nearbyHospital || null
      ]
    );

    // Insert images
    const imagesList = prop.images && prop.images.length > 0
      ? prop.images
      : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80']; // Fallback image

    let displayOrder = 0;
    for (const url of imagesList) {
      await db.run(
        `INSERT INTO property_images (id, property_id, image_url, display_order)
         VALUES (?, ?, ?, ?)`,
        [`img-${propertyId}-${displayOrder}`, propertyId, url, displayOrder]
      );
      displayOrder++;
    }

    // Insert verifications (pending status by default)
    const docs = prop.documents || [{ name: 'Title Deed', status: 'pending' }, { name: 'Tax Receipt', status: 'pending' }];
    for (const doc of docs) {
      await db.run(
        `INSERT INTO property_verifications (id, property_id, document_name, status)
         VALUES (?, ?, ?, ?)`,
        [`v-${propertyId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, propertyId, doc.name, doc.status || 'pending']
      );
    }

    // Fetch the newly created property to return
    const row = await db.get(`
      SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.avatar as owner_avatar, o.role as owner_role, o.verification_status as owner_verification_status
      FROM properties p
      LEFT JOIN profiles o ON p.owner_id = o.id
      WHERE p.id = ?
    `, [propertyId]);

    const finalImages = await db.all('SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order', [propertyId]);
    const finalVerifications = await db.all('SELECT * FROM property_verifications WHERE property_id = ?', [propertyId]);

    const formatted = formatProperty(row, finalImages, finalVerifications);

    // Create system notification for verification status
    await db.run(
      `INSERT INTO notifications (id, user_id, type, title, message, read)
       VALUES (?, ?, 'system', 'Listing Pending Approval', ?, 0)`,
      [`notif-${Date.now()}`, ownerId, `Your property "${prop.title}" has been uploaded and is in the verification queue.`]
    );

    await db.close();
    return res.status(201).json({ property: formatted });
  } catch (error) {
    console.error('Create property error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to submit property listing.' });
  }
});

// 4. DELETE Property listing
router.delete('/:id', authenticateToken, async (req, res) => {
  const db = await getDbConnection();

  try {
    const propertyId = req.params.id;

    // Check if property exists and user is owner or admin
    const prop = await db.get('SELECT owner_id FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (prop.owner_id !== req.user.id && req.user.role !== 'admin') {
      await db.close();
      return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
    }

    await db.run('DELETE FROM properties WHERE id = ?', [propertyId]);
    await db.close();
    return res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to delete property listing.' });
  }
});

// 5. POST Verify Property (Admin Only)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  const db = await getDbConnection();
  try {
    const propertyId = req.params.id;

    const prop = await db.get('SELECT title, owner_id FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    await db.run('UPDATE properties SET verified_property = 1 WHERE id = ?', [propertyId]);
    await db.run("UPDATE property_verifications SET status = 'verified' WHERE property_id = ?", [propertyId]);

    // Send notification to owner
    await db.run(
      `INSERT INTO notifications (id, user_id, type, title, message, read)
       VALUES (?, ?, 'system', 'Listing Verified! 🎉', ?, 0)`,
      [`notif-${Date.now()}`, prop.owner_id, `Your property "${prop.title}" has been successfully verified by an admin.`]
    );

    await db.close();
    return res.json({ success: true, message: 'Property and documents verified.' });
  } catch (error) {
    console.error('Verify property error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to verify property.' });
  }
});

// 6. POST Verify Owner (Admin Only)
router.post('/:id/verify-owner', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  const db = await getDbConnection();
  try {
    const propertyId = req.params.id;

    const prop = await db.get('SELECT owner_id FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    await db.run('UPDATE properties SET verified_owner = 1 WHERE id = ?', [propertyId]);
    await db.run("UPDATE profiles SET verification_status = 'verified' WHERE id = ?", [prop.owner_id]);

    await db.close();
    return res.json({ success: true, message: 'Owner identity verified successfully.' });
  } catch (error) {
    console.error('Verify owner error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to verify owner.' });
  }
});

// 7. POST Mark property as sold or rented
router.post('/:id/status', authenticateToken, async (req, res) => {
  const { availability } = req.body; // 'available', 'rented', 'sold'
  if (!availability || !['available', 'rented', 'sold'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability status.' });
  }

  const db = await getDbConnection();
  try {
    const propertyId = req.params.id;

    const prop = await db.get('SELECT title, owner_id, purpose FROM properties WHERE id = ?', [propertyId]);
    if (!prop) {
      await db.close();
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (prop.owner_id !== req.user.id && req.user.role !== 'admin') {
      await db.close();
      return res.status(403).json({ error: 'Unauthorized to change listing status.' });
    }

    await db.run('UPDATE properties SET availability = ? WHERE id = ?', [availability, propertyId]);

    // Send notification to owner
    await db.run(
      `INSERT INTO notifications (id, user_id, type, title, message, read)
       VALUES (?, ?, 'system', ?, ?, 0)`,
      [
        `notif-${Date.now()}`,
        prop.owner_id,
        `Property ${availability.toUpperCase()}`,
        `Your property "${prop.title}" is marked as ${availability}.`
      ]
    );

    await db.close();
    return res.json({ success: true, availability });
  } catch (error) {
    console.error('Change status error:', error);
    await db.close();
    return res.status(500).json({ error: 'Failed to update property status.' });
  }
});

export default router;
