import React, { useContext } from "react";
import { Stack } from "../../components/atoms/Stack";
import { MealPlanContext } from "../../data/meal-plan";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { PantryContext } from "../../data/pantry";
import { Spinner } from "../../components/atoms/Spinner";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { MealPlanSection } from "./MealPlanSection";
import { ShoppingListSection } from "../../components/organisms/ShoppingListSection";
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
        gridTemplateColumns: "minmax(100px, 800px) 1fr",
        margin: "auto",
      }}
    >
      <Stack
        css={{
          margin: "0 auto",
          gridColumn: "1 / 2",
          [Breakpoint.TABLET]: {
            gridColumn: "1 / 3",
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
          gridColumn: "2 / 3",
          [Breakpoint.LAPTOP]: { display: "none" },
        }}
      >
        <PantrySection pantry={pantry?.items.map((item) => item.ingredient)} />
      </Stack>
    </Grid>
  );
}
