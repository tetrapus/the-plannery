import React from "react";
import { RecipeAction, RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { Recipe } from "../../data/recipes";
import { Breakpoint } from "../styles/Breakpoint";

interface Props {
  recipes: Recipe[];
  dismiss?: RecipeAction;
  select?: RecipeAction;
}

export function RecipeList({ recipes, dismiss, select }: Props) {
  return (
    <Stack
      css={{
        justifyContent: "center",
        [Breakpoint.TABLET]: { alignItems: "center", width: "100%" },
        [Breakpoint.MOBILE]: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "stretch",
        },
      }}
    >
      {recipes.map((recipe, idx) => {
        return (
          <RecipeCard
            recipe={recipe}
            key={idx}
            dismiss={dismiss}
            select={select}
            css={{
              marginBottom: 16,
              [Breakpoint.TABLET]: {
                marginBottom: 0,
              },
            }}
          ></RecipeCard>
        );
      })}
    </Stack>
  );
}
