import { useHouseholdCollection } from "../data/auth-state";

import {
  getIngredientsForMealPlan,
  MealPlan,
  MealPlanItem,
} from "../data/meal-plan";
import { ShoppingListTemplate } from "../components/templates/ShoppingListTemplate";
import React from "react";
import { Spinner } from "../components/atoms/Spinner";
import { RecipesCollection, getRecipes, Recipe } from "../data/recipes";
import { useSubscription } from "../util/use-subscription";

export function ShoppingListPage() {
  const mealPlan = useHouseholdCollection<MealPlan>(
    (doc) => doc.collection("mealplan"),
    (snapshot) => ({
      recipes: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
      ),
    })
  );

  const recipes = useSubscription<Recipe[]>((setRecipes) =>
    RecipesCollection.subscribe((recipes) => setRecipes(getRecipes(recipes)))
  );

  if (!mealPlan || !recipes) return <Spinner />;
  return (
    <ShoppingListTemplate
      ingredients={getIngredientsForMealPlan(recipes, mealPlan)}
    ></ShoppingListTemplate>
  );
}
