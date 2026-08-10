/**
 * AI Recommendation Scoring Engine for Nestly
 */

export function calculateMatchScore(property, preferences) {
  let score = 50; // base score starts at 50%
  const reasons = [];

  // 1. Purpose Match (Pre-filter check, but score boost if aligned)
  if (preferences.purpose && property.purpose === preferences.purpose) {
    score += 5;
  }

  // 2. Budget Scoring (Weight: 30 points max)
  if (preferences.budget) {
    const budget = preferences.budget;
    const price = property.price;

    if (price <= budget) {
      score += 25;
      // Bonus for being significantly under budget
      if (price <= budget * 0.85) {
        score += 5;
        reasons.push(`✓ Well within your budget (saves ${(100 - (price/budget)*100).toFixed(0)}%)`);
      } else {
        reasons.push("✓ Within your budget");
      }
    } else if (price <= budget * 1.15) {
      // Slightly over budget (allow soft match with penalty)
      const penaltyPercent = (price - budget) / (budget * 0.15);
      const pointsEarned = Math.max(0, 15 * (1 - penaltyPercent));
      score += pointsEarned;
      reasons.push(`⚠ Slightly above budget (by ₹${(price - budget).toLocaleString("en-IN")})`);
    } else {
      // Way over budget
      reasons.push("✗ Exceeds your budget limit");
    }
  } else {
    // If no budget specified, allocate default points
    score += 30;
  }

  // 3. BHK Room Match (Weight: 20 points max)
  if (preferences.bhk) {
    if (property.bhk === preferences.bhk) {
      score += 20;
      reasons.push(`✓ Exact room layout (${property.bhk} BHK)`);
    } else if (Math.abs(property.bhk - preferences.bhk) === 1) {
      score += 10;
      reasons.push(`✓ Close room layout (${property.bhk} BHK matches ${preferences.bhk} BHK query)`);
    } else {
      reasons.push(`✗ Room layout mismatch (${property.bhk} BHK vs ${preferences.bhk} BHK)`);
    }
  } else {
    score += 20;
  }

  // 4. Connectivity / Distance Match (Weight: 20 points max)
  // Splits into Metro (7 pts), Schools (7 pts), Hospitals (6 pts)
  let connectivityScore = 0;
  let connectivityRequested = false;

  if (preferences.metro) {
    connectivityRequested = true;
    if (property.distanceToMetro <= 500) {
      connectivityScore += 7;
      reasons.push(`✓ Just ${property.distanceToMetro}m from ${property.nearbyMetroStation || 'metro'}`);
    } else if (property.distanceToMetro <= 1200) {
      connectivityScore += 4;
      reasons.push(`✓ Metro station is nearby (${(property.distanceToMetro / 1000).toFixed(1)} km)`);
    } else {
      reasons.push(`✗ Metro is far (${(property.distanceToMetro / 1000).toFixed(1)} km)`);
    }
  }

  if (preferences.schools) {
    connectivityRequested = true;
    if (property.distanceToSchool <= 1000) {
      connectivityScore += 7;
      reasons.push(`✓ Close to schools (within ${(property.distanceToSchool / 1000).toFixed(1)} km)`);
    } else if (property.distanceToSchool <= 2000) {
      connectivityScore += 4;
      reasons.push(`✓ Schools located within 2 km`);
    } else {
      reasons.push(`✗ Nearest school is far (${(property.distanceToSchool / 1000).toFixed(1)} km)`);
    }
  }

  if (preferences.hospitals) {
    connectivityRequested = true;
    if (property.distanceToHospital <= 1000) {
      connectivityScore += 6;
      reasons.push(`✓ Hospital within ${(property.distanceToHospital / 1000).toFixed(1)} km`);
    } else if (property.distanceToHospital <= 2000) {
      connectivityScore += 3;
      reasons.push(`✓ Healthcare facilities within 2 km`);
    } else {
      reasons.push(`✗ Nearest hospital is far (${(property.distanceToHospital / 1000).toFixed(1)} km)`);
    }
  }

  if (connectivityRequested) {
    score += connectivityScore;
  } else {
    score += 20; // Default points if connectivity not requested
  }

  // 5. Amenities & Custom preferences (Weight: 15 points max)
  const amenityKeys = ["parking", "gym", "balcony", "petFriendly", "gatedCommunity", "bachelorFriendly"];
  let totalRequestedAmenities = 0;
  let matchedRequestedAmenities = 0;

  amenityKeys.forEach(key => {
    if (preferences[key]) {
      totalRequestedAmenities++;
      if (property[key]) {
        matchedRequestedAmenities++;
      }
    }
  });

  if (totalRequestedAmenities > 0) {
    const pct = matchedRequestedAmenities / totalRequestedAmenities;
    score += pct * 15;
    
    // Add specific reasons for matched key amenities
    if (preferences.petFriendly && property.petFriendly) {
      reasons.push("✓ Pet-friendly environment");
    }
    if (preferences.parking && property.parking) {
      reasons.push("✓ Parking space available");
    }
    if (preferences.gym && property.gym) {
      reasons.push("✓ On-site gym/pool amenities");
    }
    if (preferences.balcony && property.balcony) {
      reasons.push("✓ Balcony / outdoor terrace access");
    }
    if (preferences.gatedCommunity && property.gatedCommunity) {
      reasons.push("✓ High security gated community");
    }
  } else {
    score += 15;
  }

  // 6. Verification Bonus (Weight: 10 points max)
  if (property.verifiedProperty) {
    score += 5;
    reasons.push("✓ Verified Property listings & documents");
  }
  if (property.verifiedOwner) {
    score += 5;
    reasons.push("✓ Owner has undergone identity verification");
  }

  // Cap final score between 0 and 100
  const finalScore = Math.round(Math.min(100, Math.max(0, score)));

  // Generate Match Rating Label
  let rating = "Good Match";
  let badgeColor = "bg-orange-500 text-white";
  if (finalScore >= 95) {
    rating = "Excellent Match";
    badgeColor = "bg-emerald-600 text-white animate-pulse-slow";
  } else if (finalScore >= 90) {
    rating = "Best Match";
    badgeColor = "bg-primary text-white";
  } else if (finalScore < 70) {
    rating = "Fair Match";
    badgeColor = "bg-gray-500 text-white";
  }

  return {
    score: finalScore,
    reasons: reasons.slice(0, 4), // Return top 4 compelling reasons
    rating,
    badgeColor
  };
}

/**
 * Filter and Rank properties based on relevance score
 */
export function rankProperties(properties, preferences) {
  return properties
    .map(property => {
      const matchDetails = calculateMatchScore(property, preferences);
      return {
        ...property,
        matchScore: matchDetails.score,
        matchReasons: matchDetails.reasons,
        matchRating: matchDetails.rating,
        matchBadgeColor: matchDetails.badgeColor
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
