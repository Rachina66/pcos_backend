// src/services/meal/meal.service.js

import prisma from "../../config/prismaclient.js";
import { pickRandom } from "../../rules/mealPlanRuleEngine.js";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

async function generateDays(planId, riskCategory, dietFilter) {
  const usedIds = {
    BREAKFAST: [],
    LUNCH: [],
    DINNER: [],
    SNACK: [],
  };

  for (let day = 1; day <= 7; day++) {
    const meals = {};

    for (const mealType of MEAL_TYPES) {
      // First try: exclude already used meals
      let pool = await prisma.meal.findMany({
        where: {
          riskCategory,
          mealType,
          isActive: true,
          ...dietFilter,
          ...(usedIds[mealType].length > 0 && {
            NOT: { id: { in: usedIds[mealType] } },
          }),
        },
      });

      // Fallback: pool exhausted reset and allow repeats
      if (pool.length === 0) {
        pool = await prisma.meal.findMany({
          where: { riskCategory, mealType, isActive: true, ...dietFilter },
        });
      }

      const picked = pickRandom(pool);
      if (picked) usedIds[mealType].push(picked.id);
      meals[mealType] = picked?.id ?? null;
    }

    await prisma.mealPlanDay.create({
      data: {
        mealPlanId: planId,
        dayNumber: day,
        breakfastId: meals.BREAKFAST,
        lunchId: meals.LUNCH,
        dinnerId: meals.DINNER,
        snackId: meals.SNACK,
      },
    });
  }
}

export async function generateMealPlan(userId, riskCategory, dietFilter) {
  const existing = await prisma.mealPlan.findFirst({
    where: { userId, isActive: true },
  });

  if (existing) {
    await prisma.mealPlanDay.deleteMany({ where: { mealPlanId: existing.id } });
    await prisma.mealPlan.delete({ where: { id: existing.id } });
  }

  const plan = await prisma.mealPlan.create({
    data: { userId, riskCategory, isActive: true },
  });

  await generateDays(plan.id, riskCategory, dietFilter);

  return getUserPlan(userId);
}


export async function getUserPlan(userId) {
  return await prisma.mealPlan.findFirst({
    where: { userId, isActive: true },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          breakfast: true,
          lunch: true,
          dinner: true,
          snack: true,
        },
      },
    },
  });
}


export async function regenerateMealPlan(userId, dietFilter) {
  const existing = await prisma.mealPlan.findFirst({
    where: { userId, isActive: true },
  });

  if (!existing) {
    throw new Error("No active plan found. Please generate a plan first.");
  }

  const riskCategory = existing.riskCategory;

  await prisma.mealPlanDay.deleteMany({ where: { mealPlanId: existing.id } });
  await prisma.mealPlan.delete({ where: { id: existing.id } });

  const plan = await prisma.mealPlan.create({
    data: { userId, riskCategory, isActive: true },
  });

  await generateDays(plan.id, riskCategory, dietFilter);

  return getUserPlan(userId);
}

export async function getAvailableMeals(riskCategory, mealType, dietFilter) {
  return await prisma.meal.findMany({
    where: { riskCategory, mealType, isActive: true, ...dietFilter },
    select: {
      id: true,
      name: true,
      description: true,
      calories: true,
      carbs: true,
      prepTime: true,
      isVeg: true,
    },
  });
}


export async function swapMeal(userId, dayNumber, mealType, newMealId) {
  const plan = await prisma.mealPlan.findFirst({
    where: { userId, isActive: true },
  });

  if (!plan) throw new Error("No active plan found.");

  const day = await prisma.mealPlanDay.findFirst({
    where: { mealPlanId: plan.id, dayNumber },
  });

  if (!day) throw new Error(`Day ${dayNumber} not found in your plan.`);

  const newMeal = await prisma.meal.findFirst({
    where: { id: newMealId, riskCategory: plan.riskCategory, isActive: true },
  });

  if (!newMeal) throw new Error("Meal not found or doesn't match your plan.");

  const fieldMap = {
    BREAKFAST: "breakfastId",
    LUNCH: "lunchId",
    DINNER: "dinnerId",
    SNACK: "snackId",
  };

  const field = fieldMap[mealType];
  if (!field) throw new Error(`Invalid mealType: ${mealType}`);

  await prisma.mealPlanDay.update({
    where: { id: day.id },
    data: { [field]: newMealId },
  });

  return getUserPlan(userId);
}