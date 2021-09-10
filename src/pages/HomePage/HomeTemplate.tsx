import React, { useContext } from "react";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { MealPlanContext } from "../../data/meal-plan";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { PantryContext } from "../../data/pantry";
import { Spinner } from "../../components/atoms/Spinner";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { MealPlanSection } from "./MealPlanSection";
import { ShoppingListSection } from "../../components/organisms/ShoppingListSection";
import { YourHomeSection } from "./YourHomeSection";
import { useSubscription } from "../../util/use-subscription";
import { NowCookingSection } from "./NowCookingSection";
import PantrySection from "./PantrySection";
import SuggestedRecipesSection from "./SuggestedRecipesSection/SuggestedRecipesSection";

export default function HomeTemplate() {
  const pantry = useContext(PantryContext);

  const mealPlan = useContext(MealPlanContext);

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
          {mealPlan ? (
            <>
              <MealPlanSection mealPlan={mealPlan} recipes={recipes} />
              <ShoppingListSection mealPlan={mealPlan} recipes={recipes} />{" "}
            </>
          ) : null}
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
