import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const highRiskPlan = [
  {
    dayNumber: 1,
    breakfast: "Plain Yogurt with Almonds",
    lunch: "Tuna Spinach Salad with Mustard Oil",
    dinner: "Rohu Fish with Cauliflower Curry",
    snack: "Cucumber Slices",
  },
  {
    dayNumber: 2,
    breakfast: "Egg Spinach Scramble with Avocado",
    lunch: "Paneer Salad with Onion and Green Chili",
    dinner: "Chicken Choila with Zucchini",
    snack: "Almonds",
  },
  {
    dayNumber: 3,
    breakfast: "Grilled Paneer with Celery",
    lunch: "Egg Salad with Mustard Oil and Spinach",
    dinner: "Grilled Rohu Fish with Bitter Gourd",
    snack: "Roasted Chickpeas",
  },
  {
    dayNumber: 4,
    breakfast: "Avocado with Boiled Egg",
    lunch: "Chicken Lettuce Rolls with Mint",
    dinner: "Tofu Spinach Curry with Mustard Oil",
    snack: "Low Carb Pickle",
  },
  {
    dayNumber: 5,
    breakfast: "Yogurt with Chia Seeds and Cucumber",
    lunch: "Rohu Fish with Spinach",
    dinner: "Lean Mutton with Cauliflower",
    snack: "Spinach Stir-fry",
  },
  {
    dayNumber: 6,
    breakfast: "Paneer with Cucumber",
    lunch: "Chicken Pickle Salad",
    dinner: "Rohu Fish with Palak Spinach",
    snack: "Cucumber Slices",
  },
  {
    dayNumber: 7,
    breakfast: "Yogurt with Chia Seeds",
    lunch: "Egg Spinach Salad",
    dinner: "Chicken Cauliflower Curry",
    snack: "Almonds",
  },
];

const lowRiskPlan = [
  {
    dayNumber: 1,
    breakfast: "Yogurt with Local Berries and Almonds",
    lunch: "Tuna Salad with Mung Beans",
    dinner: "Rohu Fish Cauliflower Curry",
    snack: "Cucumber Lentil Dip",
  },
  {
    dayNumber: 2,
    breakfast: "Egg Spinach Scramble with Avocado",
    lunch: "Chicken Spinach Paneer Curry",
    dinner: "Mutton Zucchini Stir-fry",
    snack: "Almonds",
  },
  {
    dayNumber: 3,
    breakfast: "Paneer with Cucumber and Chia Seeds",
    lunch: "Red Lentil Soup with Spinach",
    dinner: "Rohu Fish Bitter Gourd Curry",
    snack: "Almond Butter with Celery",
  },
  {
    dayNumber: 4,
    breakfast: "Spinach Yogurt Berry Smoothie",
    lunch: "Egg Salad with Pickle",
    dinner: "Chicken Eggplant Curry with Brown Rice",
    snack: "Yogurt with Chia Seeds",
  },
  {
    dayNumber: 5,
    breakfast: "Avocado Baked Egg",
    lunch: "Chickpea Lentil Spinach Bowl",
    dinner: "Tofu Palak Spinach Curry",
    snack: "Roasted Chickpeas with Pickle",
  },
  {
    dayNumber: 6,
    breakfast: "Paneer Onion Almond Plate",
    lunch: "Rohu Fish Lettuce Wraps",
    dinner: "Mutton Green Beans Stir-fry",
    snack: "Local Berries with Almonds",
  },
  {
    dayNumber: 7,
    breakfast: "Spinach Egg Scramble with Yogurt",
    lunch: "Tofu Lentil Soup with Spinach",
    dinner: "Rohu Fish Spinach Curry",
    snack: "Cauliflower Chips",
  },
];

const generalPlan = [
  {
    dayNumber: 1,
    breakfast: "Yogurt with Berries and Almonds",
    lunch: "Tuna Pickle Spinach with Mung Beans",
    dinner: "Rohu Fish Cauliflower Curry",
    snack: "Cucumber Lentil Dip",
  },
  {
    dayNumber: 2,
    breakfast: "Egg Paneer Scramble",
    lunch: "Chicken Spinach Choila",
    dinner: "Mutton Stir-fry with Chilies",
    snack: "Almonds",
  },
  {
    dayNumber: 3,
    breakfast: "Grilled Paneer with Cucumber",
    lunch: "Red Lentil Spinach Salad",
    dinner: "Rohu Fish with Buckwheat",
    snack: "Celery with Almond Butter",
  },
  {
    dayNumber: 4,
    breakfast: "Berry Spinach Smoothie",
    lunch: "Egg Onion Salad",
    dinner: "Chicken Eggplant with Quinoa",
    snack: "Yogurt with Chia Seeds",
  },
  {
    dayNumber: 5,
    breakfast: "Avocado Egg Boat",
    lunch: "Chickpea Lentil Paneer Bowl",
    dinner: "Tofu Bitter Gourd Spinach Curry",
    snack: "Roasted Chickpeas with Pickle",
  },
  {
    dayNumber: 6,
    breakfast: "Almonds Paneer Onion Plate",
    lunch: "Rohu Fish Lettuce Wrap",
    dinner: "Mutton Green Beans",
    snack: "Berries with Almonds",
  },
  {
    dayNumber: 7,
    breakfast: "Spinach Egg Scramble",
    lunch: "Lentil Soup with Tofu and Spinach",
    dinner: "Rohu Fish Salad",
    snack: "Cauliflower Fritters",
  },
];

async function getMealId(name, mealType, riskCategory) {
  const meal = await prisma.meal.findFirst({
    where: { name, mealType, riskCategory },
  });
  if (!meal) {
    console.warn(
      `⚠️  Meal not found: "${name}" (${mealType}, ${riskCategory})`,
    );
    return null;
  }
  return meal.id;
}

async function seedPlan(riskCategory, days) {
  console.log(`\nSeeding ${riskCategory} template plan...`);
  const existing = await prisma.mealPlan.findFirst({
    where: { riskCategory, userId: null },
    include: { days: true },
  });

  if (existing) {
    await prisma.mealPlanDay.deleteMany({ where: { mealPlanId: existing.id } });
    await prisma.mealPlan.delete({ where: { id: existing.id } });
  }

  const plan = await prisma.mealPlan.create({
    data: {
      riskCategory,
      weekNumber: 1,
      isActive: true,
    },
  });
  // create each day
  for (const day of days) {
    const breakfastId = await getMealId(
      day.breakfast,
      "BREAKFAST",
      riskCategory,
    );
    const lunchId = await getMealId(day.lunch, "LUNCH", riskCategory);
    const dinnerId = await getMealId(day.dinner, "DINNER", riskCategory);
    const snackId = await getMealId(day.snack, "SNACK", riskCategory);

    await prisma.mealPlanDay.create({
      data: {
        mealPlanId: plan.id,
        dayNumber: day.dayNumber,
        breakfastId,
        lunchId,
        dinnerId,
        snackId,
      },
    });

    console.log(`  Day ${day.dayNumber} ✓`);
  }

  console.log(`${riskCategory} plan seeded ✓`);
}

async function main() {
  await seedPlan("HIGH_RISK", highRiskPlan);
  await seedPlan("LOW_RISK", lowRiskPlan);
  await seedPlan("GENERAL", generalPlan);
  console.log("\nAll template meal plans seeded ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
