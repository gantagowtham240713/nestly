// Comprehensive Cities Data for Andhra Pradesh, Telangana, and Major Indian Cities

export const ANDHRA_PRADESH_CITIES = [
  "Visakhapatnam",
  "Vijayawada",
  "Guntur",
  "Tirupati",
  "Nellore",
  "Kurnool",
  "Rajahmundry",
  "Kakinada",
  "Kadapa",
  "Anantapur",
  "Eluru",
  "Ongole",
  "Srikakulam",
  "Vizianagaram",
  "Chittoor",
  "Bhimavaram",
  "Nandyal",
  "Tenali",
  "Proddatur",
  "Hindupur",
  "Adoni",
  "Madanapalle",
  "Narasaraopet",
  "Tadepalligudem",
  "Gudivada",
  "Kavali",
  "Dharmavaram",
  "Tadipatri",
  "Amalapuram",
  "Bapatla",
  "Chirala",
  "Markapur",
  "Palakollu",
  "Bobbili",
  "Rajampet",
  "Rayachoti",
  "Machilipatnam",
  "Tanuku",
  "Narsapuram",
  "Tuni",
  "Guntakal",
  "Sullurpeta",
  "Gudur",
  "Yemmiganur",
  "Pithapuram",
  "Samalkot",
  "Vinukonda",
  "Sattenapalle",
  "Ponnur",
  "Mangalagiri",
  "Tadepalle",
  "Kandukur",
  "Nagari",
  "Palamaner",
  "Putthur"
];

export const TELANGANA_CITIES = [
  "Hyderabad",
  "Warangal",
  "Nizamabad",
  "Khammam",
  "Karimnagar",
  "Ramagundam",
  "Mahbubnagar",
  "Nalgonda",
  "Adilabad",
  "Suryapet",
  "Siddipet",
  "Miryalaguda",
  "Jagtial",
  "Mancherial",
  "Kamareddy",
  "Kothagudem",
  "Bodhan",
  "Vikarabad",
  "Wanaparthy",
  "Nagarkurnool",
  "Gadwal",
  "Bhongir",
  "Sangareddy",
  "Medak",
  "Zaheerabad",
  "Mahabubabad",
  "Jangaon",
  "Asifabad",
  "Bhupalpally",
  "Nirmal",
  "Sircilla",
  "Tandur",
  "Armoor",
  "Bellampalle",
  "Mandamarri",
  "Metpally",
  "Palwancha",
  "Kyathampur",
  "Kagaznagar",
  "Peddapalli",
  "Narayanpet",
  "Medchal",
  "Shadnagar",
  "Ghatkesar"
];

export const OTHER_MAJOR_INDIAN_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Jodhpur",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Solapur",
  "Hubli-Dharwad",
  "Bareilly",
  "Mysore",
  "Aligarh",
  "Gurgaon",
  "Noida",
  "Kochi",
  "Trivandrum",
  "Kozhikode"
];

// All combined cities for autocomplete searching
export const ALL_CITIES = [
  ...TELANGANA_CITIES,
  ...ANDHRA_PRADESH_CITIES,
  ...OTHER_MAJOR_INDIAN_CITIES
].filter((city, index, self) => self.indexOf(city) === index);

/**
 * Helper to search cities by query (case-insensitive, partial matching)
 * Supports abbreviations (e.g., "hyd" -> "Hyderabad", "beng" -> "Bengaluru", "mum" -> "Mumbai")
 */
export function searchCities(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  
  // Custom shorthand alias mappings
  const aliases = {
    'hyd': 'Hyderabad',
    'sec': 'Secunderabad',
    'vizag': 'Visakhapatnam',
    'vja': 'Vijayawada',
    'beng': 'Bengaluru',
    'blr': 'Bengaluru',
    'mum': 'Mumbai',
    'pune': 'Pune',
    'del': 'Delhi',
    'ncr': 'Delhi',
    'chn': 'Chennai',
    'kol': 'Kolkata',
    'wgl': 'Warangal',
    'tpti': 'Tirupati'
  };

  const results = [];
  
  // Check exact alias first
  if (aliases[q]) {
    results.push(aliases[q]);
  }

  // Filter all cities matching query
  ALL_CITIES.forEach(city => {
    if (city.toLowerCase().includes(q) && !results.includes(city)) {
      results.push(city);
    }
  });

  return results.slice(0, 10);
}

// City coordinates mapping for LeafletMap center synchronization
export const CITY_COORDINATES = {
  "Hyderabad": [17.3850, 78.4867],
  "Warangal": [17.9689, 79.5941],
  "Nizamabad": [18.6725, 78.0941],
  "Karimnagar": [18.4386, 79.1288],
  "Khammam": [17.2473, 80.1514],
  "Nalgonda": [17.0577, 79.2684],
  "Adilabad": [19.6641, 78.5320],
  "Suryapet": [17.1439, 79.6239],
  "Siddipet": [18.1018, 78.8520],
  "Vijayawada": [16.5062, 80.6480],
  "Tadigadapa": [16.4800, 80.6900],
  "Guntur": [16.3067, 80.4365],
  "Visakhapatnam": [17.6868, 83.2185],
  "Tirupati": [13.6288, 79.4192],
  "Nellore": [14.4426, 79.9865],
  "Kakinada": [16.9891, 82.2475],
  "Rajahmundry": [17.0005, 81.7800],
  "Kurnool": [15.8281, 78.0373],
  "Ongole": [15.5057, 80.0499],
  "Eluru": [16.7107, 81.0952],
  "Kadapa": [14.4673, 78.8242],
  "Anantapur": [14.6819, 77.6006],
  "Bengaluru": [12.9716, 77.5946],
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.7041, 77.1025],
  "Pune": [18.5204, 73.8567],
  "Chennai": [13.0827, 80.2707],
  "Kolkata": [22.5726, 88.3639],
  "Ahmedabad": [23.0225, 72.5714]
};

export function getCityCoordinates(cityName) {
  if (!cityName) return [17.3850, 78.4867];
  const nameClean = cityName.trim();
  
  if (CITY_COORDINATES[nameClean]) {
    return CITY_COORDINATES[nameClean];
  }
  
  const matchedKey = Object.keys(CITY_COORDINATES).find(
    k => k.toLowerCase().includes(nameClean.toLowerCase()) || nameClean.toLowerCase().includes(k.toLowerCase())
  );

  return matchedKey ? CITY_COORDINATES[matchedKey] : [17.3850, 78.4867];
}

