import React, { useContext } from "react";
import { Spinner } from "components/atoms/Spinner";
import { MealPlanContext } from "data/meal-plan";
import { useRecipes } from "data/recipes";
import { ShoppingListTemplate } from "./ShoppingListTemplate";

export function ShoppingListPage() {
  const mealPlan = useContext(MealPlanContext);

  const recipes = useRecipes();

  if (!mealPlan || !recipes) return <Spinner />;
  return (
    <ShoppingListTemplate
      recipes={recipes}
      mealPlan={mealPlan}
    ></ShoppingListTemplate>
  );
}
