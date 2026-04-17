// src/rules/mealPlanRuleEngine.js

// Convert ML risk result to Database category
export function mapRiskToCategory(riskLevel) {
  const map = {
    "High Risk": "HIGH_RISK",
    "Low Risk": "LOW_RISK",
    "Moderate Risk": "GENERAL",
  };

  // If something unexpected comes, default to GENERAL
  return map[riskLevel] ?? "GENERAL";
}



//  Apply diet preference rules
// This decides what meals the user is allowed to see
//
// NON_VEG  no restriction (can eat everything)
// VEG      only vegetarian meals (isVeg: true)
// VEGAN    currently treated same as VEG (Nepal context)
export function getDietFilter(dietPreference) {
  if (dietPreference === "NON_VEG") {
    return {}; // no filtering  return all meals
  }

  if (dietPreference === "VEG" || dietPreference === "VEGAN") {
    return { isVeg: true }; // only vegetarian meals
  }

 
  return {};
}



// Pick a random meal
// Used when you want variety 
// If list is empty  return null to avoid crash
export function pickRandom(meals) {
  if (!meals || meals.length === 0) return null;

  return meals[Math.floor(Math.random() * meals.length)];
}

// Validate diet preference input
// Ensures only allowed values are accepted
// Prevents bugs or invalid API calls

export function validateDietPreference(dietPreference) {
  const allowed = ["VEG", "NON_VEG", "VEGAN"];
  return allowed.includes(dietPreference);
}

// Main Rule Engine Function
export function runMealPlanRules({ riskLevel, dietPreference }) {
  // Make sure riskLevel is provided
  if (!riskLevel) {
    throw new Error("riskLevel is required");
  }

  // Validate diet preference before proceeding
  if (!validateDietPreference(dietPreference)) {
    throw new Error(
      `Invalid dietPreference: "${dietPreference}". Must be VEG, NON_VEG, or VEGAN`
    );
  }

  // Convert ML result  DB category
  const riskCategory = mapRiskToCategory(riskLevel);

  // Apply diet filtering rules
  const dietFilter = getDietFilter(dietPreference);

  // Return everything needed by the service layer
  return {
    riskCategory,
    dietFilter,  
  };
}