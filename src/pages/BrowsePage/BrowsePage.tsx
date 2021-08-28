import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { MealPlan, MealPlanItem } from "../../data/meal-plan";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { Spinner } from "../../components/atoms/Spinner";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";
import { useSubscription } from "../../util/use-subscription";
import SuggestedRecipesSection from "pages/HomePage/SuggestedRecipesSection/SuggestedRecipesSection";

interface State {
  mealPlan: MealPlan;
  ingredientFilter: string[];
  ingredientBoosts: string[];
  usePantry: boolean;
}

export function BrowsePage() {
  const initialState = {
    mealPlan: { recipes: [] },
    ingredientFilter: [],
    ingredientBoosts: [],
    usePantry: false,
  };
  const [, setState] = useState<State>(initialState);
  const { household } = useContext(AuthStateContext);

  useEffect(() => {
    if (household?.ref) {
      return household?.ref.collection("mealplan").onSnapshot((snapshot) =>
        setState((state) => ({
          ...state,
          mealPlan: {
            recipes: snapshot.docs.map(
              (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
            ),
          },
        }))
      );
    }
  }, [household]);

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );

  return (
    <Flex css={{ margin: "auto" }}>
      {recipes ? (
        <Stack
          css={{
            maxWidth: 800,
            placeItems: "flex-start",
            [Breakpoint.DESKTOP]: {
              marginLeft: "auto",
            },
          }}
        >
          <SuggestedRecipesSection recipes={recipes} />
        </Stack>
      ) : (
        <Stack
          css={{
            maxWidth: "80vw",
            width: 800,
            height: 300,
            alignItems: "center",
          }}
        >
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
    </Flex>
  );
}
