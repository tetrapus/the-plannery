import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { Breakpoint } from "components/styles/Breakpoint";
import { MealPlanContext } from "data/meal-plan";
import { PantryContext } from "data/pantry";
import { useRecipes } from "data/recipes";
import React, { useContext } from "react";
import { MealPlanSection } from "./MealPlanSection";
import { NowCookingSection } from "./NowCookingSection";
import PantrySection from "./PantrySection";
import SuggestedRecipesSection from "./SuggestedRecipesSection/SuggestedRecipesSection";

export default function HomeTemplate() {
  const pantry = useContext(PantryContext);

  const mealPlan = useContext(MealPlanContext);

  const recipes = useRecipes();

  return (
    <Flex>
      <Stack
        css={{
          margin: "auto",
          maxWidth: 800,
          [Breakpoint.TABLET]: {
            margin: 0,
          },
        }}
      >
        {recipes ? (
          <>
            <NowCookingSection recipes={recipes} />
            {mealPlan ? (
              <MealPlanSection mealPlan={mealPlan} recipes={recipes} />
            ) : null}
            <SuggestedRecipesSection recipes={recipes} />
          </>
        ) : (
          <Stack
            css={{
              marginLeft: "auto",
              marginRight: "auto",
              alignItems: "center",
            }}
          >
            <Spinner size={256} />
            Downloading recipe database...
          </Stack>
        )}
      </Stack>
      <Stack
        css={{
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <PantrySection pantry={pantry?.items.map((item) => item.ingredient)} />
      </Stack>
    </Flex>
  );
}
