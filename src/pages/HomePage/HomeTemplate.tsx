import React, { useContext } from "react";
import { Stack } from "../../components/atoms/Stack";
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
import { Grid } from "../../components/atoms/Grid";

export default function HomeTemplate() {
  const pantry = useContext(PantryContext);

  const mealPlan = useContext(MealPlanContext);

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );

  return (
    <Grid
      css={{
        gridTemplateColumns: "1fr minmax(100px, 800px) 1fr",
      }}
    >
      <Stack
        css={{
          margin: "0 16px",
          gridColumn: "1 / 2",
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <YourHomeSection />
      </Stack>
      <Stack
        css={{
          margin: "0 auto",
          gridColumn: "2 / 3",
          [Breakpoint.TABLET]: {
            gridColumn: "1 / 4",
            margin: 0,
          },
        }}
      >
        {recipes ? (
          <>
            <NowCookingSection recipes={recipes} />
            {mealPlan ? (
              <>
                <MealPlanSection mealPlan={mealPlan} recipes={recipes} />
                <ShoppingListSection
                  mealPlan={mealPlan}
                  recipes={recipes}
                />{" "}
              </>
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
          marginLeft: 16,
          gridColumn: "3 / 4",
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <PantrySection pantry={pantry?.items.map((item) => item.ingredient)} />
      </Stack>
    </Grid>
  );
}
