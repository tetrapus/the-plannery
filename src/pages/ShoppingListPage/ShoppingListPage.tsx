import { MealPlanContext } from "../../data/meal-plan";
import { ShoppingListTemplate } from "./ShoppingListTemplate";
import React, { useContext } from "react";
import { Spinner } from "../../components/atoms/Spinner";
import { RecipesCollection, getRecipes, Recipe } from "../../data/recipes";
import { useSubscription } from "../../util/use-subscription";

export function ShoppingListPage() {
  const mealPlan = useContext(MealPlanContext);

  const recipes = useSubscription<Recipe[]>((setRecipes) =>
    RecipesCollection.subscribe((recipes) => setRecipes(getRecipes(recipes)))
  );

  if (!mealPlan || !recipes) return <Spinner />;
  return (
    <ShoppingListTemplate
      recipes={recipes}
      mealPlan={mealPlan}
    ></ShoppingListTemplate>
  );
}
