import React from "react";
import { RecipeHistory } from "../../data/recipe-history";
import { getRecipe, Recipe } from "../../data/recipes";
import { Stack } from "../../components/atoms/Stack";
import { RecipeList } from "../../components/organisms/RecipeList";

interface Props {
  history: RecipeHistory;
  recipes: Recipe[];
}

export function HistoryTemplate({ history, recipes }: Props) {
  return (
    <Stack css={{ margin: "auto" }}>
      <h1>Recipe History</h1>

      <RecipeList
        recipes={history.history
          .map((item) => getRecipe(recipes, item.slug))
          .filter((x): x is Recipe => !!x)}
      ></RecipeList>
    </Stack>
  );
}
