import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { MealPlan, MealPlanItem } from "../../data/meal-plan";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { PantryContext } from "../../data/pantry";
import { Spinner } from "../../components/atoms/Spinner";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";
import { MealPlanSection } from "./MealPlanSection";
import { ShoppingListSection } from "../../components/organisms/ShoppingListSection";
import { YourHomeSection } from "./YourHomeSection";
import { useSubscription } from "../../util/use-subscription";
import { NowCookingSection } from "./NowCookingSection";
import PantrySection from "./PantrySection";
import SuggestedRecipesSection from "./SuggestedRecipesSection/SuggestedRecipesSection";

interface State {
  mealPlan: MealPlan;
  ingredientFilter: string[];
  ingredientBoosts: string[];
  usePantry: boolean;
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    ingredientFilter: [],
    ingredientBoosts: [],
    usePantry: false,
  };
  const [{ mealPlan }, setState] = useState<State>(initialState);
  const { household } = useContext(AuthStateContext);
  const pantry = useContext(PantryContext);

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
          <NowCookingSection recipes={recipes} />
          <MealPlanSection mealPlan={mealPlan} recipes={recipes} />
          <ShoppingListSection mealPlan={mealPlan} recipes={recipes} />
          <SuggestedRecipesSection recipes={recipes} />
        </Stack>
      ) : (
        <Stack
          css={{ maxWidth: 800, marginLeft: "auto", alignItems: "center" }}
        >
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
      <Stack
        css={{
          width: "calc(50vw - 400px)",
          marginLeft: 16,
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <YourHomeSection />
        <PantrySection pantry={pantry?.items.map((item) => item.ingredient)} />
      </Stack>
    </Flex>
  );
}
