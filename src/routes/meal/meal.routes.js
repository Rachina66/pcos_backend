// src/routes/meal/meal.routes.js

import express from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import * as mealController from "../../controllers/meal/meal.controller.js";

const router = express.Router();

// All meal plan routes require authentication
router.use(authenticate);

//Core Flow
//  After prediction  generate plan
router.post("/generate", mealController.generatePlan);

//  Dashboard load  get active plan
router.get("/my-plan", mealController.getMyPlan);

//  Regenerate button → fresh random plan
router.post("/regenerate", mealController.regeneratePlan);

// Swap Flow
// Open swap UI → get available meals to pick from
router.get("/available-meals", mealController.getAvailableMeals);

router.patch("/swap-meal", mealController.swapMeal);

export default router;
