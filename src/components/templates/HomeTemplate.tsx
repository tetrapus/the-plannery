import React, { useEffect, useState } from "react";
import { RecipeCard } from "../molecules/RecipeCard";
import { Recipe } from "../../models/Recipe";
import { Stack } from "../atoms/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import {
  getIngredientsForMealPlan,
  MealPlanCollection,
} from "../../data/meal-plan";
import {
  getRecipe,
  getSuggestedRecipes,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { PantryCollection } from "../../data/pantry";
import { SuggestedRecipesSection } from "../organisms/SuggestedRecipesSection";

export default function HomeTemplate() {
  const initialState = {
    mealPlan: MealPlanCollection.initialState,
    pantry: PantryCollection.initialState,
    recipes: RecipesCollection.initialState,
  };
  const [{ mealPlan, pantry }, setState] = useState(initialState);
  useEffect(() => {
    MealPlanCollection.subscribe((value) =>
      setState((state) => ({ ...state, mealPlan: value }))
    );
    PantryCollection.subscribe((value) =>
      setState((state) => ({ ...state, pantry: value }))
    );
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
  }, []);

  return (
    <Flex>
      <Stack
        css={{ maxWidth: 800, marginLeft: "auto", placeItems: "flex-start" }}
      >
        <h1>Your meal plan</h1>
        {mealPlan.recipes.map((recipe) => (
          <Flex key={recipe}>
            <RecipeCard recipe={getRecipe(recipe) as Recipe} />
            <FontAwesomeIcon
              icon={faTimes}
              css={{ fontSize: 36, margin: 42, color: "grey" }}
              onClick={() =>
                MealPlanCollection.set({
                  recipes: mealPlan.recipes.filter((r) => r !== recipe),
                })
              }
            />
          </Flex>
        ))}
        <h2>Shopping list</h2>
        <IngredientList ingredients={getIngredientsForMealPlan(mealPlan)} />
        <SuggestedRecipesSection
          recipes={getSuggestedRecipes()}
          mealPlan={mealPlan.recipes}
        />
      </Stack>
      <Stack css={{ maxWidth: "calc(50vw - 400px)" }}>
        <h2>Pantry</h2>
        <IngredientList ingredients={pantry.items} />
      </Stack>
    </Flex>
  );
}
