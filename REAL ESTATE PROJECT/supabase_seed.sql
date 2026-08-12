-- Supabase Seed SQL Script for Nestly Real Estate Application
-- Safely populates properties across Telangana and Andhra Pradesh cities

-- 1. Insert Sample Properties
INSERT INTO public.properties (
  title, description, purpose, property_type, price, city, locality,
  latitude, longitude, bhk, bathrooms, area, furnishing, parking, gym,
  balcony, pet_friendly, gated_community, bachelor_friendly, availability,
  verified_owner, verified_property, views, favorites, inquiries
) VALUES 
-- HYDERABAD
('Modern 2BHK Apartment near Ameerpet Metro', 'Beautiful, well-ventilated 2BHK apartment situated on the 4th floor. Features spacious living room and modern modular kitchen.', 'rent', 'apartment', 22000, 'Hyderabad', 'Ameerpet', 17.4375, 78.4482, 2, 2, 1100, 'semi-furnished', true, true, true, true, true, true, 'available', true, true, 342, 28, 14),
('Luxury 3BHK Gated Villa in Kompally', 'Exclusive 3BHK Villa in a serene gated township with private garden, clubhouse, swimming pool, and 24/7 security.', 'buy', 'villa', 8500000, 'Hyderabad', 'Kompally', 17.5340, 78.4835, 3, 3, 2400, 'fully-furnished', true, true, true, true, true, false, 'available', true, true, 195, 42, 9),
('Premium 3BHK Flat near Hitec City Tech Park', 'High-rise luxury apartment with panoramic views of Cyberabad. Located walking distance from major IT parks.', 'rent', 'apartment', 45000, 'Hyderabad', 'Hitec City', 17.4435, 78.3772, 3, 3, 1850, 'fully-furnished', true, true, true, true, true, true, 'available', true, true, 510, 65, 23),

-- WARANGAL
('3BHK Independent Villa near Kazipet Junction', 'Independent 3BHK duplex villa with private terrace and covered car parking in a quiet neighborhood.', 'buy', 'independent_house', 5800000, 'Warangal', 'Kazipet', 17.9785, 79.5250, 3, 3, 1900, 'semi-furnished', true, false, true, true, false, true, 'available', true, true, 120, 15, 6),
('Affordable 2BHK Flat for Rent in Hanamkonda', 'Clean and well-maintained 2BHK apartment near NIT Warangal campus. Ideal for families.', 'rent', 'apartment', 14000, 'Warangal', 'Hanamkonda', 17.9950, 79.5850, 2, 2, 1150, 'semi-furnished', true, false, true, true, true, true, 'available', true, true, 88, 9, 4),

-- NIZAMABAD
('2BHK Family Apartment near Khaleelwadi', 'Comfortable 2BHK apartment close to schools, main market, and bus station.', 'rent', 'apartment', 11000, 'Nizamabad', 'Khaleelwadi', 18.6750, 78.0980, 2, 2, 1050, 'unfurnished', true, false, true, false, false, true, 'available', true, true, 64, 5, 2),

-- KARIMNAGAR
('Modern 2BHK Flat near Collectorate Complex', 'Newly constructed 2BHK flat with lifts, power backup, and modern kitchen fittings.', 'rent', 'apartment', 12500, 'Karimnagar', 'Collectorate Road', 18.4350, 79.1300, 2, 2, 1200, 'semi-furnished', true, true, true, true, true, true, 'available', true, true, 92, 11, 5),

-- VIJAYAWADA
('Luxury 3BHK Apartment on MG Road', 'Prime location 3BHK flat on MG Road with marble flooring, modular kitchen, and excellent connectivity.', 'buy', 'apartment', 7800000, 'Vijayawada', 'MG Road', 16.5075, 80.6495, 3, 3, 1750, 'semi-furnished', true, true, true, true, true, true, 'available', true, true, 410, 38, 17),
('Spacious 2BHK Flat for Rent in Benz Circle', 'Centrally located 2BHK flat near Benz Circle junction. Close to malls and top schools.', 'rent', 'apartment', 24000, 'Vijayawada', 'Benz Circle', 16.5010, 80.6550, 2, 2, 1250, 'fully-furnished', true, false, true, true, true, true, 'available', true, true, 280, 24, 11),

-- TADIGADAPA
('3BHK Modern Apartment near Poranki Center', 'Spacious 3BHK flat in Tadigadapa/Poranki area. Features granite flooring and dedicated car parking.', 'rent', 'apartment', 18000, 'Tadigadapa', 'Poranki', 16.4810, 80.6920, 3, 3, 1600, 'semi-furnished', true, false, true, true, true, true, 'available', true, true, 165, 18, 7),
('Gated Community 3BHK House in Tadigadapa', 'Independent 3BHK Villa on Yanamalakuduru Road, Tadigadapa. Gated township with park and solar power fencing.', 'buy', 'independent_house', 6500000, 'Tadigadapa', 'Yanamalakuduru Road', 16.4780, 80.6880, 3, 3, 2100, 'semi-furnished', true, true, true, true, true, false, 'available', true, true, 215, 29, 12),

-- VISAKHAPATNAM
('Beachfront 3BHK Luxury Flat in RK Beach', 'Breathtaking ocean views from all bedrooms! Premium 3BHK apartment located directly on RK Beach Road.', 'buy', 'apartment', 12500000, 'Visakhapatnam', 'RK Beach Road', 17.7100, 83.3180, 3, 3, 2200, 'fully-furnished', true, true, true, true, true, true, 'available', true, true, 620, 84, 31),
('Premium 2BHK Sea View Flat for Rent in MVP Colony', 'Spacious 2BHK flat in prime MVP Colony Sector 4. Close to drive-in restaurants and beach.', 'rent', 'apartment', 28000, 'Visakhapatnam', 'MVP Colony', 17.7420, 83.3350, 2, 2, 1300, 'semi-furnished', true, true, true, true, true, true, 'available', true, true, 310, 32, 15),

-- TIRUPATI
('3BHK Apartment near Alipiri Gate', 'Serene 3BHK flat offering peaceful views of Tirumala hills. Located close to Alipiri entrance.', 'rent', 'apartment', 19000, 'Tirupati', 'Alipiri Road', 13.6350, 79.4120, 3, 2, 1450, 'semi-furnished', true, false, true, false, true, true, 'available', true, true, 140, 16, 8),

-- GUNTUR
('3BHK Luxury Flat near Brodipet 4th Line', 'Prime residential flat in Brodipet with high quality wood work and modular kitchen.', 'buy', 'apartment', 6900000, 'Guntur', 'Brodipet', 16.3080, 80.4380, 3, 3, 1650, 'semi-furnished', true, false, true, true, true, true, 'available', true, true, 175, 19, 9),

-- NELLORE
('2BHK Family Flat for Rent in Magunta Layout', 'Spacious 2BHK apartment in Magunta Layout with power backup and reserved car parking slot.', 'rent', 'apartment', 14500, 'Nellore', 'Magunta Layout', 14.4450, 79.9880, 2, 2, 1180, 'semi-furnished', true, false, true, true, true, true, 'available', true, true, 95, 8, 3),

-- KAKINADA
('3BHK Flat near Bhanugudi Junction', 'Well-built 3BHK flat close to main commercial hubs, hospitals, and educational institutions in Kakinada.', 'buy', 'apartment', 5800000, 'Kakinada', 'Bhanugudi', 16.9920, 82.2490, 3, 3, 1550, 'semi-furnished', true, false, true, true, true, true, 'available', true, true, 110, 12, 5),

-- RAJAHMUNDRY
('Godavari River View 3BHK Apartment', 'Scenic 3BHK flat in Danavaipeta with river views, spacious balconies, and modern amenities.', 'buy', 'apartment', 6400000, 'Rajahmundry', 'Danavaipeta', 17.0020, 81.7820, 3, 3, 1700, 'semi-furnished', true, true, true, true, true, true, 'available', true, true, 155, 21, 10),

-- KURNOOL
('3BHK Independent Villa near Sampath Nagar', 'Beautiful independent duplex house in Sampath Nagar Kurnool with private terrace garden.', 'buy', 'independent_house', 4800000, 'Kurnool', 'Sampath Nagar', 15.8300, 78.0400, 3, 3, 1800, 'semi-furnished', true, false, true, true, false, true, 'available', true, true, 85, 9, 4),

-- ONGOLE
('3BHK Flat for Rent near Lawyer Pet', 'Quiet, family-friendly 3BHK flat near Lawyer Pet main road with lift and 24/7 security.', 'rent', 'apartment', 13500, 'Ongole', 'Lawyer Pet', 15.5080, 80.0520, 3, 2, 1400, 'semi-furnished', true, false, true, false, true, true, 'available', true, true, 72, 6, 2);

-- 2. Insert Images into property_images
INSERT INTO public.property_images (property_id, image_url, display_order)
SELECT id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 0 FROM public.properties WHERE availability = 'available';
