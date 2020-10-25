import React from "react";
import { getIngredientsForMealPlan, MealPlan } from "../../data/meal-plan";
import { IngredientList } from "./IngredientList";

interface Props {
  mealPlan: MealPlan;
}

export function ShoppingListSection({ mealPlan }: Props) {
  if (!mealPlan.recipes.length) {
    return null;
  }
  return (
    <>
      <h2>Shopping list</h2>
      <IngredientList ingredients={getIngredientsForMealPlan(mealPlan)} />
    </>
  );
}
