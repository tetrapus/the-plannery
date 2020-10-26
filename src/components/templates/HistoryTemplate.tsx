import React from "react";
import { RecipeHistory } from "../../data/recipe-history";
import { getRecipe, Recipe } from "../../data/recipes";
import { Stack } from "../atoms/Stack";
import { RecipeList } from "../organisms/RecipeList";

interface Props {
  history: RecipeHistory;
}

export function HistoryTemplate({ history }: Props) {
  return (
    <Stack css={{ alignItems: "center", margin: 16 }}>
      <RecipeList
        recipes={history.history
          .map((item) => getRecipe(item.slug))
          .filter((x): x is Recipe => !!x)}
        actions={[]}
      ></RecipeList>
    </Stack>
  );
}
