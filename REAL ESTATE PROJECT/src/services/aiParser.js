/**
 * Conversational AI Search Parser for Nestly
 * Extracts structural parameters from natural language queries.
 */

const KNOWN_CITIES = ["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Pune", "Chennai"];

const KNOWN_LOCALITIES = [
  "Ameerpet", "Gachibowli", "Hitec City", "Kompally", "Whitefield", 
  "HSR Layout", "Indiranagar", "Bandra", "Dwarka", "Kharadi", "Adyar"
];

export function parseNaturalLanguageQuery(query = "") {
  const cleanQuery = query.toLowerCase();
  
  // Default values
  const results = {
    purpose: null,
    propertyType: null,
    budget: null,
    bhk: null,
    city: null,
    locality: null,
    metro: false,
    schools: false,
    hospitals: false,
    parking: false,
    gym: false,
    balcony: false,
    petFriendly: false,
    gatedCommunity: false,
    bachelorFriendly: false,
    furnishing: null
  };

  // 1. Purpose: rent vs buy
  if (/\b(rent|renting|lease|pg|tenant|paying guest|monthly)\b/.test(cleanQuery)) {
    results.purpose = "rent";
  } else if (/\b(buy|purchase|own|buying|sale|investment|acquire)\b/.test(cleanQuery)) {
    results.purpose = "buy";
  }

  // 2. Property Type
  if (/\b(villa|villas|row house|bungalow)\b/.test(cleanQuery)) {
    results.propertyType = "villa";
  } else if (/\b(apartment|apartments|flat|flats|condo|condominium)\b/.test(cleanQuery)) {
    results.propertyType = "apartment";
  } else if (/\b(builder floor|floor|floors)\b/.test(cleanQuery)) {
    results.propertyType = "builder_floor";
  } else if (/\b(independent house|house|home)\b/.test(cleanQuery)) {
    results.propertyType = "independent_house";
  }

  // 3. BHK
  const bhkMatch = cleanQuery.match(/(\d+)\s*(?:bhk|bedroom|bed room|br)/i);
  if (bhkMatch) {
    results.bhk = parseInt(bhkMatch[1], 10);
  }

  // 4. Budget Parser (e.g. under 25k, below 80 lakhs, under 1.5 Cr, max 30000)
  // Match patterns like "under 25k", "below 80 lakhs", "under 1.5 crore", "budget 25000", "price 30000"
  const priceRegex = /(?:under|below|budget|max|maximum|within|less than|around|approx|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lacs|lac|cr|crore|crores)?\b/gi;
  let match;
  let parsedBudget = null;

  // Let's find matches that are contextually budget.
  // Avoid matching BHK numbers or room numbers.
  while ((match = priceRegex.exec(cleanQuery)) !== null) {
    const rawNum = parseFloat(match[1]);
    const multiplierStr = (match[2] || "").toLowerCase();

    // Skip if it looks like BHK (e.g. "2 bhk")
    const matchIndex = match.index;
    const precedingText = cleanQuery.slice(Math.max(0, matchIndex - 10), matchIndex);
    if (/bhk|bedroom/i.test(precedingText)) continue;

    let multiplier = 1;
    if (multiplierStr.includes("k")) {
      multiplier = 1000;
    } else if (multiplierStr.includes("thousand")) {
      multiplier = 1000;
    } else if (multiplierStr.includes("lakh") || multiplierStr.includes("lac")) {
      multiplier = 100000;
    } else if (multiplierStr.includes("cr") || multiplierStr.includes("crore")) {
      multiplier = 10000000;
    } else {
      // If no unit, check magnitude
      if (rawNum > 100 && rawNum <= 500) {
        // e.g. "under 150 sqft" or similar, skip or treat as lakh if context buy
        continue;
      }
      if (rawNum <= 200) {
        // If buy context, could be lakhs (e.g. buy under 80 -> 80 lakhs)
        if (results.purpose === "buy" || /\b(villa|buy|house)\b/.test(cleanQuery)) {
          multiplier = 100000;
        } else {
          // rent context? "rent under 25" -> 25k
          multiplier = 1000;
        }
      }
    }

    const calculatedPrice = rawNum * multiplier;
    if (calculatedPrice > 5000) { // filter out trivial low numbers
      parsedBudget = calculatedPrice;
      break; // take first matches
    }
  }
  results.budget = parsedBudget;

  // 5. City Search
  for (const city of KNOWN_CITIES) {
    const regex = new RegExp(`\\b${city.toLowerCase()}\\b`, "i");
    if (regex.test(cleanQuery)) {
      results.city = city;
      break;
    }
  }

  // 6. Locality Search
  for (const locality of KNOWN_LOCALITIES) {
    const regex = new RegExp(`\\b${locality.toLowerCase()}\\b`, "i");
    if (regex.test(cleanQuery)) {
      results.locality = locality;
      break;
    }
  }

  // 7. Connectivity & Nearby places
  if (/\b(metro|train|subway|transit|station|metro station)\b/.test(cleanQuery)) {
    results.metro = true;
  }
  if (/\b(school|schools|college|university|education|academy)\b/.test(cleanQuery)) {
    results.schools = true;
  }
  if (/\b(hospital|hospitals|clinic|doctor|medical|healthcare)\b/.test(cleanQuery)) {
    results.hospitals = true;
  }

  // 8. Amenities
  if (/\b(parking|car park|garage|covered parking|parkings)\b/.test(cleanQuery)) {
    results.parking = true;
  }
  if (/\b(gym|gymnasium|fitness|workout|pool|swimming)\b/.test(cleanQuery)) {
    results.gym = true;
  }
  if (/\b(balcony|balconies|terrace|deck)\b/.test(cleanQuery)) {
    results.balcony = true;
  }
  if (/\b(pet|pets|pet friendly|dog|cat|animal|pet-friendly)\b/.test(cleanQuery)) {
    results.petFriendly = true;
  }
  if (/\b(gated|gated community|society|security|guard)\b/.test(cleanQuery)) {
    results.gatedCommunity = true;
  }
  if (/\b(bachelor|bachelors|student|singles|bachelor friendly)\b/.test(cleanQuery)) {
    results.bachelorFriendly = true;
  }

  // 9. Furnishing status
  if (/\b(unfurnished|empty)\b/.test(cleanQuery)) {
    results.furnishing = "unfurnished";
  } else if (/\b(semi-furnished|semi furnished|partially furnished)\b/.test(cleanQuery)) {
    results.furnishing = "semi-furnished";
  } else if (/\b(fully furnished|furnished)\b/.test(cleanQuery)) {
    results.furnishing = "furnished";
  }

  return results;
}

/**
 * Helper to convert parser output back into a human-friendly tags array
 */
export function getChipsFromParsedQuery(parsed) {
  const chips = [];

  if (parsed.purpose) {
    chips.push({
      id: "purpose",
      type: "purpose",
      label: parsed.purpose === "rent" ? "For Rent" : "For Sale",
      value: parsed.purpose
    });
  }

  if (parsed.propertyType) {
    const labels = {
      apartment: "Apartment",
      villa: "Villa",
      independent_house: "Independent House",
      builder_floor: "Builder Floor"
    };
    chips.push({
      id: "propertyType",
      type: "propertyType",
      label: labels[parsed.propertyType] || parsed.propertyType,
      value: parsed.propertyType
    });
  }

  if (parsed.bhk) {
    chips.push({
      id: "bhk",
      type: "bhk",
      label: `${parsed.bhk} BHK`,
      value: parsed.bhk
    });
  }

  if (parsed.budget) {
    let formattedBudget = `₹${parsed.budget.toLocaleString("en-IN")}`;
    if (parsed.budget >= 10000000) {
      formattedBudget = `Under ₹${(parsed.budget / 10000000).toFixed(1)} Cr`;
    } else if (parsed.budget >= 100000) {
      formattedBudget = `Under ₹${parsed.budget / 100000} Lakhs`;
    } else if (parsed.budget >= 1000) {
      formattedBudget = `Under ₹${parsed.budget / 1000}k`;
    }
    chips.push({
      id: "budget",
      type: "budget",
      label: formattedBudget,
      value: parsed.budget
    });
  }

  if (parsed.city) {
    chips.push({
      id: "city",
      type: "city",
      label: parsed.city,
      value: parsed.city
    });
  }

  if (parsed.locality) {
    chips.push({
      id: "locality",
      type: "locality",
      label: parsed.locality,
      value: parsed.locality
    });
  }

  if (parsed.metro) {
    chips.push({ id: "metro", type: "metro", label: "Metro Nearby", value: true });
  }

  if (parsed.schools) {
    chips.push({ id: "schools", type: "schools", label: "Schools Nearby", value: true });
  }

  if (parsed.hospitals) {
    chips.push({ id: "hospitals", type: "hospitals", label: "Hospitals Nearby", value: true });
  }

  if (parsed.parking) {
    chips.push({ id: "parking", type: "parking", label: "Parking Available", value: true });
  }

  if (parsed.gym) {
    chips.push({ id: "gym", type: "gym", label: "Gym Access", value: true });
  }

  if (parsed.balcony) {
    chips.push({ id: "balcony", type: "balcony", label: "Balcony Available", value: true });
  }

  if (parsed.petFriendly) {
    chips.push({ id: "petFriendly", type: "petFriendly", label: "Pet Friendly", value: true });
  }

  if (parsed.gatedCommunity) {
    chips.push({ id: "gatedCommunity", type: "gatedCommunity", label: "Gated Community", value: true });
  }

  if (parsed.bachelorFriendly) {
    chips.push({ id: "bachelorFriendly", type: "bachelorFriendly", label: "Bachelors Allowed", value: true });
  }

  if (parsed.furnishing) {
    chips.push({
      id: "furnishing",
      type: "furnishing",
      label: parsed.furnishing.charAt(0).toUpperCase() + parsed.furnishing.slice(1),
      value: parsed.furnishing
    });
  }

  return chips;
}
