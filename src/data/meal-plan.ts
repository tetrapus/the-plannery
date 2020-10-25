import Ingredient from "./ingredients";
import { getRecipe } from "./recipes";

export interface MealPlanItem {
  ref: firebase.firestore.DocumentReference;
  slug: string;
  by: string;
  added: firebase.firestore.Timestamp;
}
export interface MealPlan {
  recipes: MealPlanItem[];
}

export function getIngredientsForMealPlan(mealPlan: MealPlan): Ingredient[] {
  const ingredientTypes = {} as any;
  const ingredients = {} as any;
  mealPlan.recipes.forEach(({ slug }) => {
    const recipe = getRecipe(slug);
    if (!recipe) return;
    recipe.ingredients.forEach((ingredient) => {
      let qtys = ingredientTypes[ingredient.type.id];
      if (!qtys) {
        ingredientTypes[ingredient.type.id] = {};
        qtys = ingredientTypes[ingredient.type.id];
      }
      if (qtys[ingredient.unit as string]) {
        qtys[ingredient.unit as string].qty += ingredient.qty;
        qtys[ingredient.unit as string].usedIn.push(recipe);
      } else {
        qtys[ingredient.unit as string] = {
          qty: ingredient.qty,
          usedIn: [recipe],
        };
        ingredients[ingredient.type.id] = ingredient.type;
      }
    });
  });
  const result = [] as any;
  Object.entries(ingredientTypes).forEach(([id, qtys]) => {
    Object.entries(qtys as any).forEach(([unit, data]) => {
      result.push({
        unit,
        ...(data as any),
        type: ingredients[id],
      });
    });
  });
  return result;
}
