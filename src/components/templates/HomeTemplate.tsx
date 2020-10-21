import React, { useContext, useEffect, useState } from "react";
import { RecipeCard } from "../molecules/RecipeCard";
import { Recipe } from "../../models/Recipe";
import { Stack } from "../atoms/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import { getIngredientsForMealPlan } from "../../data/meal-plan";
import {
  getRecipe,
  getSuggestedRecipes,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { Pantry, PantryItem } from "../../data/pantry";
import { SuggestedRecipesSection } from "../organisms/SuggestedRecipesSection";
import { Spinner } from "../atoms/Spinner";
import { MealPlan, MealPlanItem } from "../../models/MealPlan";
import { HouseholdContext } from "../../data/household";

interface State {
  mealPlan: MealPlan;
  pantry: Pantry;
  recipes: any[];
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    pantry: { items: [] },
    recipes: RecipesCollection.initialState,
  };
  const [{ mealPlan, pantry, recipes }, setState] = useState<State>(
    initialState
  );
  const { ref } = useContext(HouseholdContext);
  useEffect(() => {
    const hooks: (() => void)[] = [];
    if (ref) {
      hooks.push(
        ref.collection("mealplan").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            mealPlan: {
              recipes: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
              ),
            },
          }))
        )
      );
      hooks.push(
        ref.collection("pantry").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            pantry: {
              items: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
              ),
            },
          }))
        )
      );
    }
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
    return () => hooks.forEach((hook) => hook());
  }, [ref]);

  return (
    <Flex>
      {recipes.length ? (
        <Stack
          css={{ maxWidth: 800, marginLeft: "auto", placeItems: "flex-start" }}
        >
          {mealPlan.recipes.length ? (
            <>
              <h1>Your meal plan</h1>
              {mealPlan.recipes.map((recipe) => (
                <Flex key={recipe.slug}>
                  <RecipeCard recipe={getRecipe(recipe.slug) as Recipe} />
                  <Stack css={{ fontSize: 36, margin: 42, color: "grey" }}>
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={() => recipe.ref.delete()}
                    />
                  </Stack>
                </Flex>
              ))}
              <h2>Shopping list</h2>
              <IngredientList
                ingredients={getIngredientsForMealPlan(mealPlan)}
                pantry={pantry}
              />
            </>
          ) : null}
          <SuggestedRecipesSection
            recipes={getSuggestedRecipes()}
            mealPlan={mealPlan}
          />
        </Stack>
      ) : (
        <Stack css={{ width: 800, marginLeft: "auto", alignItems: "center" }}>
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
      <Stack css={{ width: "calc(50vw - 400px)" }}>
        <h2>Pantry</h2>
        <IngredientList
          ingredients={pantry.items.map((item) => item.ingredient)}
          pantry={pantry}
        />
      </Stack>
    </Flex>
  );
}
