import { supabase } from './supabaseClient';

export const SAMPLE_PROPERTIES_SEED_DATA = [
  // TELANGANA - HYDERABAD
  {
    title: "Modern 2BHK Apartment near Ameerpet Metro",
    description: "Beautiful, well-ventilated 2BHK apartment situated on the 4th floor. Features a spacious living room, modern modular kitchen, and balconies with a city view.",
    purpose: "rent",
    property_type: "apartment",
    price: 22000,
    city: "Hyderabad",
    locality: "Ameerpet",
    latitude: 17.4375,
    longitude: 78.4482,
    bhk: 2,
    bathrooms: 2,
    area: 1100,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    distance_to_metro: 300,
    nearby_metro_station: "Ameerpet Metro Station",
    distance_to_school: 500,
    nearby_school: "Hyderabad Public School",
    distance_to_hospital: 800,
    nearby_hospital: "Aster Prime Hospital",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Luxury 3BHK Gated Villa in Kompally",
    description: "Exclusive 3BHK Villa in a serene gated township with private garden, clubhouse, swimming pool, and 24/7 security.",
    purpose: "buy",
    property_type: "villa",
    price: 8500000,
    city: "Hyderabad",
    locality: "Kompally",
    latitude: 17.5340,
    longitude: 78.4835,
    bhk: 3,
    bathrooms: 3,
    area: 2400,
    furnishing: "fully-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: false,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    distance_to_metro: 3500,
    nearby_metro_station: "JBS Parade Ground Metro",
    distance_to_school: 400,
    nearby_school: "DRS International School",
    distance_to_hospital: 1200,
    nearby_hospital: "Rush Hospitals",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Premium 3BHK Flat near Hitec City Tech Park",
    description: "High-rise luxury apartment with panoramic views of Cyberabad. Located walking distance from major IT parks.",
    purpose: "rent",
    property_type: "apartment",
    price: 45000,
    city: "Hyderabad",
    locality: "Hitec City",
    latitude: 17.4435,
    longitude: 78.3772,
    bhk: 3,
    bathrooms: 3,
    area: 1850,
    furnishing: "fully-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    distance_to_metro: 400,
    nearby_metro_station: "Hitec City Metro Station",
    distance_to_school: 1000,
    nearby_school: "Oakridge International",
    distance_to_hospital: 700,
    nearby_hospital: "Medicover Hospitals",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // TELANGANA - WARANGAL
  {
    title: "3BHK Independent Villa near Kazipet Junction",
    description: "Independent 3BHK duplex villa with private terrace and covered car parking in a quiet residential neighborhood.",
    purpose: "buy",
    property_type: "independent_house",
    price: 5800000,
    city: "Warangal",
    locality: "Kazipet",
    latitude: 17.9785,
    longitude: 79.5250,
    bhk: 3,
    bathrooms: 3,
    area: 1900,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: false,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Affordable 2BHK Flat for Rent in Hanamkonda",
    description: "Clean and well-maintained 2BHK apartment near NIT Warangal campus. Ideal for families and university faculty.",
    purpose: "rent",
    property_type: "apartment",
    price: 14000,
    city: "Warangal",
    locality: "Hanamkonda",
    latitude: 17.9950,
    longitude: 79.5850,
    bhk: 2,
    bathrooms: 2,
    area: 1150,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // TELANGANA - NIZAMABAD
  {
    title: "2BHK Family Apartment near Khaleelwadi",
    description: "Comfortable 2BHK apartment close to schools, main market, and bus station.",
    purpose: "rent",
    property_type: "apartment",
    price: 11000,
    city: "Nizamabad",
    locality: "Khaleelwadi",
    latitude: 18.6750,
    longitude: 78.0980,
    bhk: 2,
    bathrooms: 2,
    area: 1050,
    furnishing: "unfurnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: false,
    gated_community: false,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // TELANGANA - KARIMNAGAR
  {
    title: "Modern 2BHK Flat near Collectorate Complex",
    description: "Newly constructed 2BHK flat with lifts, power backup, and modern kitchen fittings.",
    purpose: "rent",
    property_type: "apartment",
    price: 12500,
    city: "Karimnagar",
    locality: "Collectorate Road",
    latitude: 18.4350,
    longitude: 79.1300,
    bhk: 2,
    bathrooms: 2,
    area: 1200,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - VIJAYAWADA
  {
    title: "Luxury 3BHK Apartment on MG Road",
    description: "Prime location 3BHK flat on MG Road with marble flooring, modular kitchen, and excellent connectivity to railway station.",
    purpose: "buy",
    property_type: "apartment",
    price: 7800000,
    city: "Vijayawada",
    locality: "MG Road",
    latitude: 16.5075,
    longitude: 80.6495,
    bhk: 3,
    bathrooms: 3,
    area: 1750,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Spacious 2BHK Flat for Rent in Benz Circle",
    description: "Centrally located 2BHK flat near Benz Circle junction. Close to malls, hospitals, and top schools.",
    purpose: "rent",
    property_type: "apartment",
    price: 24000,
    city: "Vijayawada",
    locality: "Benz Circle",
    latitude: 16.5010,
    longitude: 80.6550,
    bhk: 2,
    bathrooms: 2,
    area: 1250,
    furnishing: "fully-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - TADIGADAPA
  {
    title: "3BHK Modern Apartment near Poranki Center",
    description: "Spacious 3BHK flat in Tadigadapa/Poranki area. Features granite flooring, 24-hr municipal water, and dedicated car parking.",
    purpose: "rent",
    property_type: "apartment",
    price: 18000,
    city: "Tadigadapa",
    locality: "Poranki",
    latitude: 16.4810,
    longitude: 80.6920,
    bhk: 3,
    bathrooms: 3,
    area: 1600,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Gated Community 3BHK House in Tadigadapa",
    description: "Independent 3BHK Villa on Yanamalakuduru Road, Tadigadapa. Gated township with park and solar power fencing.",
    purpose: "buy",
    property_type: "independent_house",
    price: 6500000,
    city: "Tadigadapa",
    locality: "Yanamalakuduru Road",
    latitude: 16.4780,
    longitude: 80.6880,
    bhk: 3,
    bathrooms: 3,
    area: 2100,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: false,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - VISAKHAPATNAM
  {
    title: "Beachfront 3BHK Luxury Flat in RK Beach",
    description: "Breathtaking ocean views from all bedrooms! Premium 3BHK apartment located directly on RK Beach Road.",
    purpose: "buy",
    property_type: "apartment",
    price: 12500000,
    city: "Visakhapatnam",
    locality: "RK Beach Road",
    latitude: 17.7100,
    longitude: 83.3180,
    bhk: 3,
    bathrooms: 3,
    area: 2200,
    furnishing: "fully-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    title: "Premium 2BHK Sea View Flat for Rent in MVP Colony",
    description: "Spacious 2BHK flat in prime MVP Colony Sector 4. Close to drive-in restaurants, beach, and tech hub.",
    purpose: "rent",
    property_type: "apartment",
    price: 28000,
    city: "Visakhapatnam",
    locality: "MVP Colony",
    latitude: 17.7420,
    longitude: 83.3350,
    bhk: 2,
    bathrooms: 2,
    area: 1300,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - TIRUPATI
  {
    title: "3BHK Apartment near Alipiri Gate",
    description: "Serene 3BHK flat offering peaceful views of Tirumala hills. Located close to Alipiri entrance.",
    purpose: "rent",
    property_type: "apartment",
    price: 19000,
    city: "Tirupati",
    locality: "Alipiri Road",
    latitude: 13.6350,
    longitude: 79.4120,
    bhk: 3,
    bathrooms: 2,
    area: 1450,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: false,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - GUNTUR
  {
    title: "3BHK Luxury Flat near Brodipet 4th Line",
    description: "Prime residential flat in Brodipet with high quality wood work, modular kitchen, and double balconies.",
    purpose: "buy",
    property_type: "apartment",
    price: 6900000,
    city: "Guntur",
    locality: "Brodipet",
    latitude: 16.3080,
    longitude: 80.4380,
    bhk: 3,
    bathrooms: 3,
    area: 1650,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - NELLORE
  {
    title: "2BHK Family Flat for Rent in Magunta Layout",
    description: "Spacious 2BHK apartment in Magunta Layout with power backup and reserved car parking slot.",
    purpose: "rent",
    property_type: "apartment",
    price: 14500,
    city: "Nellore",
    locality: "Magunta Layout",
    latitude: 14.4450,
    longitude: 79.9880,
    bhk: 2,
    bathrooms: 2,
    area: 1180,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - KAKINADA
  {
    title: "3BHK Flat near Bhanugudi Junction",
    description: "Well-built 3BHK flat close to main commercial hubs, hospitals, and educational institutions in Kakinada.",
    purpose: "buy",
    property_type: "apartment",
    price: 5800000,
    city: "Kakinada",
    locality: "Bhanugudi",
    latitude: 16.9920,
    longitude: 82.2490,
    bhk: 3,
    bathrooms: 3,
    area: 1550,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - RAJAHMUNDRY
  {
    title: "Godavari River View 3BHK Apartment",
    description: "Scenic 3BHK flat in Danavaipeta with river views, spacious balconies, and modern amenities.",
    purpose: "buy",
    property_type: "apartment",
    price: 6400000,
    city: "Rajahmundry",
    locality: "Danavaipeta",
    latitude: 17.0020,
    longitude: 81.7820,
    bhk: 3,
    bathrooms: 3,
    area: 1700,
    furnishing: "semi-furnished",
    parking: true,
    gym: true,
    balcony: true,
    pet_friendly: true,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - KURNOOL
  {
    title: "3BHK Independent Villa near Sampath Nagar",
    description: "Beautiful independent duplex house in Sampath Nagar Kurnool with private terrace garden.",
    purpose: "buy",
    property_type: "independent_house",
    price: 4800000,
    city: "Kurnool",
    locality: "Sampath Nagar",
    latitude: 15.8300,
    longitude: 78.0400,
    bhk: 3,
    bathrooms: 3,
    area: 1800,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: true,
    gated_community: false,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
    ]
  },

  // ANDHRA PRADESH - ONGOLE
  {
    title: "3BHK Flat for Rent near Lawyer Pet",
    description: "Quiet, family-friendly 3BHK flat near Lawyer Pet main road with lift and 24/7 security.",
    purpose: "rent",
    property_type: "apartment",
    price: 13500,
    city: "Ongole",
    locality: "Lawyer Pet",
    latitude: 15.5080,
    longitude: 80.0520,
    bhk: 3,
    bathrooms: 2,
    area: 1400,
    furnishing: "semi-furnished",
    parking: true,
    gym: false,
    balcony: true,
    pet_friendly: false,
    gated_community: true,
    bachelor_friendly: true,
    availability: "available",
    verified_owner: true,
    verified_property: true,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

/**
 * Safely seed sample properties into Supabase if missing or if properties table has < 5 items.
 */
export async function seedSampleProperties() {
  try {
    // 1. Check existing count in Supabase
    const { data: existing, error: countErr } = await supabase
      .from('properties')
      .select('id, city');

    if (countErr) {
      console.warn("Could not query properties for seeding:", countErr.message);
      return;
    }

    // Check if Tadigadapa, Vijayawada, or Visakhapatnam already exist
    const existingCities = (existing || []).map(p => p.city?.toLowerCase());
    const hasTadigadapa = existingCities.includes('tadigadapa');
    const hasVijayawada = existingCities.includes('vijayawada');

    if (existing && existing.length >= 15 && hasTadigadapa && hasVijayawada) {
      // Data already seeded safely!
      return;
    }

    console.log("Seeding realistic sample property data into Supabase...");

    // 2. Ensure multiple distinct owner profiles exist in Supabase
    const DEMO_OWNERS = [
      { id: "owner-rahul-001", name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91 98480 12345", city: "Hyderabad", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=rahul" },
      { id: "owner-priya-002", name: "Priya Verma", email: "priya.verma@example.com", phone: "+91 98490 23456", city: "Visakhapatnam", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=priya" },
      { id: "owner-arjun-003", name: "Arjun Reddy", email: "arjun.reddy@example.com", phone: "+91 98470 34567", city: "Vijayawada", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=arjun" },
      { id: "owner-sneha-004", name: "Sneha Rao", email: "sneha.rao@example.com", phone: "+91 98460 45678", city: "Tadigadapa", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sneha" },
      { id: "owner-satish-005", name: "Satish Kumar", email: "satish.k@example.com", phone: "+91 98450 56789", city: "Guntur", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=satish" }
    ];

    const ownerIdsMap = [];
    for (const owner of DEMO_OWNERS) {
      const { data: existingOwner } = await supabase.from('profiles').select('id').eq('email', owner.email).maybeSingle();
      if (existingOwner) {
        ownerIdsMap.push(existingOwner.id);
      } else {
        // Try inserting profile
        const { data: insertedOwner } = await supabase.from('profiles').upsert({
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: 'owner',
          phone: owner.phone,
          city: owner.city,
          avatar: owner.avatar,
          verification_status: 'verified'
        }).select().maybeSingle();

        if (insertedOwner) {
          ownerIdsMap.push(insertedOwner.id);
        } else {
          ownerIdsMap.push(owner.id);
        }
      }
    }

    // 3. Insert properties into Supabase with round-robin assigned owner IDs
    let propIdx = 0;
    for (const prop of SAMPLE_PROPERTIES_SEED_DATA) {
      // Check if property with title already exists
      const { data: exists } = await supabase
        .from('properties')
        .select('id')
        .eq('title', prop.title)
        .maybeSingle();

      if (exists) {
        propIdx++;
        continue; // Skip duplicate
      }

      const assignedOwnerId = ownerIdsMap[propIdx % ownerIdsMap.length];

      const dbProperty = {
        title: prop.title,
        description: prop.description,
        purpose: prop.purpose,
        property_type: prop.property_type,
        price: prop.price,
        city: prop.city,
        locality: prop.locality,
        latitude: prop.latitude,
        longitude: prop.longitude,
        bhk: prop.bhk,
        bathrooms: prop.bathrooms,
        area: prop.area,
        furnishing: prop.furnishing,
        parking: prop.parking,
        gym: prop.gym,
        balcony: prop.balcony,
        pet_friendly: prop.pet_friendly,
        gated_community: prop.gated_community,
        bachelor_friendly: prop.bachelor_friendly,
        availability: 'available',
        verified_owner: true,
        verified_property: true,
        owner_id: assignedOwnerId,
        distance_to_metro: prop.distance_to_metro || null,
        nearby_metro_station: prop.nearby_metro_station || null,
        distance_to_school: prop.distance_to_school || null,
        nearby_school: prop.nearby_school || null,
        distance_to_hospital: prop.distance_to_hospital || null,
        nearby_hospital: prop.nearby_hospital || null,
        views: 120,
        favorites: 15,
        inquiries: 8
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('properties')
        .insert(dbProperty)
        .select()
        .single();

      if (insertErr) {
        console.warn(`Failed to insert property ${prop.title}:`, insertErr.message);
        propIdx++;
        continue;
      }

      // Insert images into property_images table
      if (inserted && prop.images && prop.images.length > 0) {
        const dbImages = prop.images.map((url, idx) => ({
          property_id: inserted.id,
          image_url: url,
          display_order: idx
        }));
        await supabase.from('property_images').insert(dbImages);
      }

      propIdx++;
    }

    console.log("Sample properties with distinct owners successfully seeded into Supabase!");
  } catch (err) {
    console.error("Error during sample property seeding:", err);
  }
}
