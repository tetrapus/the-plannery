import React from "react";
import { getIngredientsForMealPlan, MealPlan } from "../../data/meal-plan";
import { Pantry } from "../../data/pantry";
import { IngredientList } from "./IngredientList";

interface Props {
  mealPlan: MealPlan;
  pantry: Pantry;
}

export function ShoppingListSection({ mealPlan, pantry }: Props) {
  if (!mealPlan.recipes.length) {
    return null;
  }
  return (
    <>
      <h2>Shopping list</h2>
      <IngredientList
        ingredients={getIngredientsForMealPlan(mealPlan)}
        pantry={pantry}
      />
    </>
  );
}
