import Ingredient from "../models/Ingredient";
import { MealPlan } from "../models/MealPlan";
import { CollectionFactory } from "./CollectionFactory";
import { getRecipe } from "./recipes";

export const MealPlanCollection = CollectionFactory<MealPlan>("meal-plan", {
  recipes: [],
});

export function getIngredientsForMealPlan(mealPlan: MealPlan): Ingredient[] {
  const ingredientTypes = {} as any;
  const ingredients = {} as any;
  mealPlan.recipes.forEach((slug) => {
    getRecipe(slug)?.ingredients.forEach((ingredient) => {
      let qtys = ingredientTypes[ingredient.type.id];
      if (!qtys) {
        ingredientTypes[ingredient.type.id] = {};
        qtys = ingredientTypes[ingredient.type.id];
      }
      if (qtys[ingredient.unit]) {
        qtys[ingredient.unit] += ingredient.qty;
      } else {
        qtys[ingredient.unit] = ingredient.qty;
        ingredients[ingredient.type.id] = ingredient.type;
      }
    });
  });
  const result = [] as any;
  Object.entries(ingredientTypes).forEach(([id, qtys]) => {
    Object.entries(qtys as any).forEach(([unit, qty]) => {
      result.push({
        unit,
        qty,
        type: ingredients[id],
      });
    });
  });
  return result;
}
