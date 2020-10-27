import React from "react";
import { getIngredientsForMealPlan, MealPlan } from "../../data/meal-plan";
import { Recipe } from "../../data/recipes";
import { Spinner } from "../atoms/Spinner";
import { IngredientList } from "./IngredientList";

interface Props {
  mealPlan: MealPlan;
  recipes: Recipe[];
}

export function ShoppingListSection({ mealPlan, recipes }: Props) {
  if (!mealPlan.recipes.length) {
    return null;
  }
  if (!recipes) {
    return <Spinner />;
  }
  return (
    <>
      <h2>Shopping list</h2>
      <IngredientList
        ingredients={getIngredientsForMealPlan(recipes, mealPlan)}
      />
    </>
  );
}
