import { getIngredientsForMealPlan, MealPlan } from "data/meal-plan";
import { Recipe } from "data/recipes";
import React from "react";
import { Spinner } from "../atoms/Spinner";
import { IngredientList } from "./IngredientList";

interface Props {
  mealPlan: MealPlan;
  exclusions?: MealPlan;
  recipes: Recipe[];
}

export function ShoppingListSection({ mealPlan, recipes, exclusions }: Props) {
  if (!mealPlan.recipes.length) {
    return null;
  }

  if (!recipes) {
    return <Spinner />;
  }

  return (
    <IngredientList
      ingredients={getIngredientsForMealPlan(recipes, mealPlan)}
      exclusions={getIngredientsForMealPlan(
        recipes,
        exclusions || { recipes: [] }
      )}
    />
  );
}
