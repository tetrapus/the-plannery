import { MealPlan } from "../models/MealPlan";

const storageKey = "meal-plan";

export function getMealPlan(): MealPlan {
  return { recipes: [] };
}
