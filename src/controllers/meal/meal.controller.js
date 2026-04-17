// src/controllers/meal/meal.controller.js

import { runMealPlanRules } from "../../rules/mealPlanRuleEngine.js";
import * as mealService from "../../services/meal/meal.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";
import prisma from "../../config/prismaclient.js";

//POST /api/meal-plan/generate
// Flow: prediction result + diet preference → generate user's 7-day plan
export const generatePlan = async (req, res) => {
  try {
    const { predictionId, dietPreference } = req.body;
    const userId = req.user.id;

    if (!predictionId || !dietPreference) {
      return errorResponse(
        res,
        "predictionId and dietPreference are required",
        400,
      );
    }

    // Fetch prediction to get riskLevel
    const prediction = await prisma.prediction.findFirst({
      where: { id: predictionId, userId },
    });

    if (!prediction) return notFoundResponse(res, "Prediction not found");

    // Run rule engine → get riskCategory + dietFilter
    const { riskCategory, dietFilter } = runMealPlanRules({
      riskLevel: prediction.riskLevel,
      dietPreference,
    });

    // Generate plan
    const plan = await mealService.generateMealPlan(
      userId,
      riskCategory,
      dietFilter,
    );

    return successResponse(res, plan, "Meal plan generated successfully", 201);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to generate meal plan",
      500,
    );
  }
};

//GET /api/meal-plan/my-plan
// Flow: user opens dashboard → fetch their active plan
export const getMyPlan = async (req, res) => {
  try {
    const plan = await mealService.getUserPlan(req.user.id);

    if (!plan)
      return notFoundResponse(
        res,
        "No active meal plan found. Please generate one.",
      );

    return successResponse(res, plan, "Meal plan fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch meal plan", 500, error.message);
  }
};

// POST /api/meal-plan/regenerate
// Flow: user hits "Regenerate" → fresh random plan, same risk category
export const regeneratePlan = async (req, res) => {
  try {
    const { dietPreference } = req.body;
    const userId = req.user.id;

    if (!dietPreference) {
      return errorResponse(res, "dietPreference is required", 400);
    }

    const { dietFilter } = runMealPlanRules({
      riskLevel: "Low Risk", // placeholder - regenerate keeps existing riskCategory from DB
      dietPreference,
    });

    const plan = await mealService.regenerateMealPlan(userId, dietFilter);

    return successResponse(res, plan, "Meal plan regenerated successfully");
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to regenerate meal plan",
      500,
    );
  }
};

//  GET /api/meal-plan/available-meals
// Flow: user opens swap UI → fetch meals they can swap into
// Query: ?mealType=DINNER&isVeg=true
export const getAvailableMeals = async (req, res) => {
  try {
    const { mealType, isVeg } = req.query;
    const userId = req.user.id;

    if (!mealType) {
      return errorResponse(res, "mealType is required", 400);
    }

    // Get user's active plan to know their riskCategory
    const plan = await mealService.getUserPlan(userId);
    if (!plan) return notFoundResponse(res, "No active plan found.");

    const dietFilter = isVeg === "true" ? { isVeg: true } : {};

    const meals = await mealService.getAvailableMeals(
      plan.riskCategory,
      mealType.toUpperCase(),
      dietFilter,
    );

    return successResponse(res, meals, "Available meals fetched");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch available meals",
      500,
      error.message,
    );
  }
};

export const swapMeal = async (req, res) => {
  try {
    const { dayNumber, mealType, newMealId } = req.body;
    const userId = req.user.id;

    if (!dayNumber || !mealType || !newMealId) {
      return errorResponse(
        res,
        "dayNumber, mealType and newMealId are required",
        400,
      );
    }

    if (dayNumber < 1 || dayNumber > 7) {
      return errorResponse(res, "dayNumber must be between 1 and 7", 400);
    }

    const plan = await mealService.swapMeal(
      userId,
      dayNumber,
      mealType.toUpperCase(),
      newMealId,
    );

    return successResponse(res, plan, "Meal swapped successfully");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to swap meal", 500);
  }
};
