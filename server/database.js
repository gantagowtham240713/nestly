import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'homematch.db');

export async function getDbConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function initializeDatabase() {
  const db = await getDbConnection();
  console.log('Connected to SQLite database at:', dbPath);

  // Enable foreign keys
  await db.get('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL CHECK(role IN ('user', 'owner', 'admin')),
      phone TEXT,
      city TEXT,
      language TEXT,
      email_verified INTEGER DEFAULT 1 NOT NULL,
      verification_status TEXT DEFAULT 'verified' CHECK(verification_status IN ('pending', 'verified', 'rejected')),
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      purpose TEXT NOT NULL CHECK(purpose IN ('rent', 'buy')),
      property_type TEXT NOT NULL CHECK(property_type IN ('apartment', 'villa', 'independent_house', 'builder_floor')),
      price NUMERIC NOT NULL,
      city TEXT NOT NULL,
      locality TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      bhk INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      area INTEGER NOT NULL,
      furnishing TEXT DEFAULT 'unfurnished' CHECK(furnishing IN ('unfurnished', 'semi-furnished', 'furnished')),
      parking INTEGER DEFAULT 0 NOT NULL,
      gym INTEGER DEFAULT 0 NOT NULL,
      balcony INTEGER DEFAULT 0 NOT NULL,
      pet_friendly INTEGER DEFAULT 0 NOT NULL,
      gated_community INTEGER DEFAULT 0 NOT NULL,
      bachelor_friendly INTEGER DEFAULT 0 NOT NULL,
      availability TEXT DEFAULT 'available' NOT NULL CHECK(availability IN ('available', 'rented', 'sold')),
      verified_owner INTEGER DEFAULT 0 NOT NULL,
      verified_property INTEGER DEFAULT 0 NOT NULL,
      owner_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
      distance_to_metro INTEGER,
      nearby_metro_station TEXT,
      distance_to_school INTEGER,
      nearby_school TEXT,
      distance_to_hospital INTEGER,
      nearby_hospital TEXT,
      views INTEGER DEFAULT 0 NOT NULL,
      favorites INTEGER DEFAULT 0 NOT NULL,
      inquiries INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS property_images (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, property_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(property_id, user_id, owner_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
      sender_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      sender_role TEXT NOT NULL CHECK(sender_role IN ('user', 'owner')),
      text TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('system', 'chat', 'recommend', 'alert')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS property_verifications (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
      document_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL CHECK(status IN ('pending', 'verified', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables created/verified successfully.');

  // Seed default data if profiles table is empty
  const profileCount = await db.get('SELECT COUNT(*) as count FROM profiles');
  if (profileCount.count === 0) {
    console.log('Seeding initial data...');
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    // 1. Seed Profiles
    const defaultProfiles = [
      { id: 'usr-1', name: 'Gowtham Seeker', email: 'user@example.com', role: 'user', phone: '+91 99999 88888', city: 'Hyderabad', language: 'English', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=gowtham' },
      { id: 'own-1', name: 'Satish Kumar', email: 'owner@example.com', role: 'owner', phone: '+91 98765 43210', city: 'Hyderabad', language: 'English', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=satish' },
      { id: 'own-2', name: 'Rahul Broker', email: 'pending@example.com', role: 'owner', phone: '+91 91234 56789', city: 'Bangalore', language: 'Hindi', email_verified: 1, verification_status: 'pending', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rahul' },
      { id: 'adm-1', name: 'Admin Moderator', email: 'admin@example.com', role: 'admin', phone: '+91 90000 11111', city: 'Mumbai', language: 'English', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' },
      
      // Seed other mock property owners
      { id: 'owner-2', name: 'Ramesh Rao', email: 'ramesh.rao@example.com', role: 'owner', phone: '+91 99887 76655', city: 'Hyderabad', language: 'Telugu', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ramesh' },
      { id: 'owner-3', name: 'Priya Sharma', email: 'priya.s@example.com', role: 'owner', phone: '+91 91234 56789', city: 'Bangalore', language: 'English', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=priya' },
      { id: 'owner-4', name: 'Amit Patel', email: 'amit.p@example.com', role: 'owner', phone: '+91 93456 78901', city: 'Bangalore', language: 'Gujarati', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=amit' },
      { id: 'owner-5', name: 'Vikram Malhotra', email: 'vikram@example.com', role: 'owner', phone: '+91 98222 33333', city: 'Mumbai', language: 'English', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vikram' },
      { id: 'owner-6', name: 'Sanjay Verma', email: 'sanjay.v@example.com', role: 'owner', phone: '+91 97777 88888', city: 'Delhi', language: 'Hindi', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sanjay' },
      { id: 'owner-7', name: 'Anil Deshmukh', email: 'anil.d@example.com', role: 'owner', phone: '+91 94220 11223', city: 'Pune', language: 'Marathi', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=anil' },
      { id: 'owner-8', name: 'Karthik Raja', email: 'karthik.r@example.com', role: 'owner', phone: '+91 98400 12345', city: 'Chennai', language: 'Tamil', email_verified: 1, verification_status: 'verified', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karthik' }
    ];

    for (const p of defaultProfiles) {
      await db.run(
        `INSERT INTO profiles (id, name, email, avatar, role, phone, city, language, email_verified, verification_status, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.email, p.avatar, p.role, p.phone, p.city, p.language, p.email_verified, p.verification_status, defaultPasswordHash]
      );
    }

    // 2. Seed Properties (mapped directly from mockProperties.js)
    const mockProperties = [
      {
        id: "prop-1",
        title: "Modern 2BHK Apartment near Metro",
        description: "Beautiful, well-ventilated 2BHK apartment situated on the 4th floor. Features a spacious living room, modern modular kitchen, and balconies with a city view. Located in a highly accessible area, just walking distance from the metro station. Excellent choice for families or working professionals.",
        purpose: "rent",
        propertyType: "apartment",
        price: 22000,
        city: "Hyderabad",
        locality: "Ameerpet",
        latitude: 17.4375,
        longitude: 78.4482,
        bhk: 2,
        bathrooms: 2,
        area: 1100,
        furnishing: "semi-furnished",
        parking: 1,
        gym: 1,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "own-1", // Maps to Satish Kumar
        distanceToMetro: 300,
        nearbyMetroStation: "Ameerpet Metro Station",
        distanceToSchool: 500,
        nearbySchool: "Hyderabad Public School",
        distanceToHospital: 800,
        nearbyHospital: "Aster Prime Hospital",
        views: 342,
        favorites: 28,
        inquiries: 14,
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-2",
        title: "Premium 3BHK Villa with Private Garden",
        description: "Stunning 3BHK independent villa in a secure gated community. Comes with 2 covered car parkings, a private landscaped lawn, spacious terrace, and high-end Italian marble flooring. Proximity to major multispecialty hospitals makes it perfect for families seeking convenience and luxury.",
        purpose: "buy",
        propertyType: "villa",
        price: 7800000,
        city: "Hyderabad",
        locality: "Kompally",
        latitude: 17.5348,
        longitude: 78.4805,
        bhk: 3,
        bathrooms: 3,
        area: 2400,
        furnishing: "furnished",
        parking: 1,
        gym: 0,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 0,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "owner-2",
        distanceToMetro: 4200,
        nearbyMetroStation: "Miyapur Metro Station",
        distanceToSchool: 1500,
        nearbySchool: "Sherwood Public School",
        distanceToHospital: 400,
        nearbyHospital: "Surekha Hospital & Diagnostics",
        views: 520,
        favorites: 42,
        inquiries: 19,
        images: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-3",
        title: "Pet-Friendly 2BHK Near Tech Park",
        description: "Modern, pet-friendly 2BHK apartment situated in the heart of Whitefield's IT corridor. Equipped with high-speed internet connectivity potential, dedicated gym access, power backup, and intercom facilities. Highly recommended for couples and tech workers.",
        purpose: "rent",
        propertyType: "apartment",
        price: 28000,
        city: "Bangalore",
        locality: "Whitefield",
        latitude: 12.9698,
        longitude: 77.7500,
        bhk: 2,
        bathrooms: 2,
        area: 1200,
        furnishing: "semi-furnished",
        parking: 1,
        gym: 1,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "owner-3",
        distanceToMetro: 800,
        nearbyMetroStation: "Whitefield Kadugodi Metro",
        distanceToSchool: 1100,
        nearbySchool: "The Vydehi School",
        distanceToHospital: 600,
        nearbyHospital: "Vydehi Hospital",
        views: 450,
        favorites: 37,
        inquiries: 22,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-4",
        title: "1BHK Cozy Flat for Rent",
        description: "Compact and affordable 1BHK builder floor flat, ideal for bachelors or students. Safe neighborhood, regular water supply, and easy connectivity to supermarkets and food courts. Located very close to public transportation networks.",
        purpose: "rent",
        propertyType: "builder_floor",
        price: 14000,
        city: "Bangalore",
        locality: "HSR Layout",
        latitude: 12.9141,
        longitude: 77.6411,
        bhk: 1,
        bathrooms: 1,
        area: 600,
        furnishing: "unfurnished",
        parking: 0,
        gym: 0,
        balcony: 0,
        petFriendly: 0,
        gatedCommunity: 0,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 0,
        verifiedProperty: 1,
        ownerId: "owner-4",
        distanceToMetro: 1800,
        nearbyMetroStation: "HSR Layout Metro Station (Proposed)",
        distanceToSchool: 400,
        nearbySchool: "NIFT School Ground",
        distanceToHospital: 700,
        nearbyHospital: "Narayana Multispeciality Hospital",
        views: 189,
        favorites: 12,
        inquiries: 8,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-5",
        title: "Luxury 4BHK Penthouse with Sea View",
        description: "Exceptional double-height ceiling 4BHK penthouse in South Mumbai. Offers breathtaking panoramic ocean views, private splash pool, automation systems, 24/7 concierge, state-of-the-art gymnasium, and massive spacing. Fully verified and ready for possession.",
        purpose: "buy",
        propertyType: "apartment",
        price: 45000000,
        city: "Mumbai",
        locality: "Bandra",
        latitude: 19.0596,
        longitude: 72.8295,
        bhk: 4,
        bathrooms: 4,
        area: 4200,
        furnishing: "furnished",
        parking: 1,
        gym: 1,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 0,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "owner-5",
        distanceToMetro: 1200,
        nearbyMetroStation: "Bandra Metro Station",
        distanceToSchool: 800,
        nearbySchool: "Bandra St. Stanislaus High School",
        distanceToHospital: 1100,
        nearbyHospital: "Lilavati Hospital",
        views: 890,
        favorites: 76,
        inquiries: 31,
        images: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-6",
        title: "Spacious 3BHK Flat near Metro Station",
        description: "Semi-furnished 3BHK flat located in a quiet lane of Dwarka. Just 200 meters from the metro station. Excellent connectivity to IGI airport. Features 3 bedrooms, 3 bathrooms, large balconies, modular kitchen, and standard security services.",
        purpose: "rent",
        propertyType: "apartment",
        price: 32000,
        city: "Delhi",
        locality: "Dwarka Sector 12",
        latitude: 28.5925,
        longitude: 77.0425,
        bhk: 3,
        bathrooms: 3,
        area: 1650,
        furnishing: "semi-furnished",
        parking: 1,
        gym: 0,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 0,
        ownerId: "owner-6",
        distanceToMetro: 200,
        nearbyMetroStation: "Dwarka Sector 12 Metro",
        distanceToSchool: 900,
        nearbySchool: "Mount Carmel School",
        distanceToHospital: 1500,
        nearbyHospital: "Manipal Hospital Dwarka",
        views: 310,
        favorites: 22,
        inquiries: 11,
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-7",
        title: "Premium 2BHK Apartment in Gated Complex",
        description: "Strategically located 2BHK apartment in Kharadi, Pune, very close to EON IT Park. Rent includes maintenance charges. The community provides premium amenities including a fully functional gym, swimming pool, clubhouse, jogging track, and multi-tier security systems.",
        purpose: "rent",
        propertyType: "apartment",
        price: 24500,
        city: "Pune",
        locality: "Kharadi",
        latitude: 18.5524,
        longitude: 73.9431,
        bhk: 2,
        bathrooms: 2,
        area: 1050,
        furnishing: "semi-furnished",
        parking: 1,
        gym: 1,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 1,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "owner-7",
        distanceToMetro: 3500,
        nearbyMetroStation: "Kalyani Nagar Metro Station",
        distanceToSchool: 400,
        nearbySchool: "Kharadi Public School",
        distanceToHospital: 900,
        nearbyHospital: "Columbia Asia Hospital",
        views: 408,
        favorites: 39,
        inquiries: 18,
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
        ]
      },
      {
        id: "prop-8",
        title: "Elegant 3BHK House with Big Terrace",
        description: "An elegant, well-designed independent house in Adyar, Chennai. Features a huge open terrace, private parking space, a pooja room, and large windows. The house is pet-friendly and located in a very peaceful residential area with mature green tree linings.",
        purpose: "buy",
        propertyType: "independent_house",
        price: 18500000,
        city: "Chennai",
        locality: "Adyar",
        latitude: 13.0033,
        longitude: 80.2550,
        bhk: 3,
        bathrooms: 3,
        area: 2100,
        furnishing: "unfurnished",
        parking: 1,
        gym: 0,
        balcony: 1,
        petFriendly: 1,
        gatedCommunity: 0,
        bachelorFriendly: 1,
        availability: "available",
        verifiedOwner: 1,
        verifiedProperty: 1,
        ownerId: "owner-8",
        distanceToMetro: 1400,
        nearbyMetroStation: "Kasturba Nagar MRTS Station",
        distanceToSchool: 600,
        nearbySchool: "St. Patrick's High School",
        distanceToHospital: 700,
        nearbyHospital: "Fortis Malar Hospital",
        views: 295,
        favorites: 18,
        inquiries: 9,
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        ]
      }
    ];

    for (const prop of mockProperties) {
      await db.run(
        `INSERT INTO properties (
          id, title, description, purpose, property_type, price, city, locality,
          latitude, longitude, bhk, bathrooms, area, furnishing, parking, gym,
          balcony, pet_friendly, gated_community, bachelor_friendly, availability,
          verified_owner, verified_property, owner_id, distance_to_metro, nearby_metro_station,
          distance_to_school, nearby_school, distance_to_hospital, nearby_hospital,
          views, favorites, inquiries
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prop.id, prop.title, prop.description, prop.purpose, prop.propertyType, prop.price, prop.city, prop.locality,
          prop.latitude, prop.longitude, prop.bhk, prop.bathrooms, prop.area, prop.furnishing, prop.parking, prop.gym,
          prop.balcony, prop.petFriendly, prop.gatedCommunity, prop.bachelorFriendly, prop.availability,
          prop.verifiedOwner, prop.verifiedProperty, prop.ownerId, prop.distanceToMetro, prop.nearbyMetroStation,
          prop.distanceToSchool, prop.nearbySchool, prop.distanceToHospital, prop.nearbyHospital,
          prop.views, prop.favorites, prop.inquiries
        ]
      );

      // Insert property images
      let displayOrder = 0;
      for (const imgUrl of prop.images) {
        await db.run(
          `INSERT INTO property_images (id, property_id, image_url, display_order)
           VALUES (?, ?, ?, ?)`,
          [`img-${prop.id}-${displayOrder}`, prop.id, imgUrl, displayOrder]
        );
        displayOrder++;
      }

      // Seed mock verifications for property
      await db.run(
        `INSERT INTO property_verifications (id, property_id, document_name, status)
         VALUES (?, ?, ?, ?)`,
        [`v-${prop.id}-1`, prop.id, 'Title Deed.pdf', prop.verifiedProperty ? 'verified' : 'pending']
      );
    }

    // 3. Seed Conversations and Messages
    const initialConversations = [
      {
        id: "convo-1",
        propertyId: "prop-1",
        userId: "usr-1", // Gowtham Seeker
        ownerId: "own-1", // Satish Kumar
        messages: [
          { id: "m-1", senderId: "own-1", senderRole: "owner", text: "Hello! Thank you for showing interest in my property. When would you like to schedule a visit?", date: "2026-07-23T10:00:00Z" }
        ]
      },
      {
        id: "convo-2",
        propertyId: "prop-3",
        userId: "usr-1", // Gowtham Seeker
        ownerId: "owner-3", // Priya Sharma
        messages: [
          { id: "m-2", senderId: "usr-1", senderRole: "user", text: "Hi Priya, is this apartment available for immediate occupancy?", date: "2026-07-24T09:00:00Z" },
          { id: "m-3", senderId: "owner-3", senderRole: "owner", text: "Yes, it is available from August 1st. We are currently accepting bookings.", date: "2026-07-24T09:05:00Z" }
        ]
      }
    ];

    for (const c of initialConversations) {
      await db.run(
        `INSERT INTO conversations (id, property_id, user_id, owner_id)
         VALUES (?, ?, ?, ?)`,
        [c.id, c.propertyId, c.userId, c.ownerId]
      );

      for (const m of c.messages) {
        await db.run(
          `INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [m.id, c.id, m.senderId, m.senderRole, m.text, m.date]
        );
      }
    }

    // 4. Seed Notifications
    const initialNotifications = [
      { id: "notif-1", userId: "usr-1", type: "system", title: "Welcome to HomeMatch AI", message: "Try our AI conversational search to find your dream property!", read: 0, date: "2026-07-24T06:00:00Z" },
      { id: "notif-2", userId: "usr-1", type: "recommend", title: "New Match Identified!", message: "A new 2BHK apartment in Ameerpet is a 97% match for your search.", read: 0, date: "2026-07-24T08:30:00Z" },
      { id: "notif-3", userId: "usr-1", type: "chat", title: "New Message from Satish", message: "When would you like to schedule a visit?", read: 0, date: "2026-07-24T10:01:00Z" }
    ];

    for (const n of initialNotifications) {
      await db.run(
        `INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [n.id, n.userId, n.type, n.title, n.message, n.read, n.date]
      );
    }

    console.log('Successfully seeded database!');
  } else {
    console.log('Database already has data. Skipping seed.');
  }

  await db.close();
}
