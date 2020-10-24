import React from "react";
import { RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { Recipe } from "../../data/recipes";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Breakpoint } from "../styles/Breakpoint";
import { IconButton } from "../atoms/IconButton";

interface Action {
  icon: IconProp;
  onClick: (recipe: Recipe) => () => void;
}

interface Props {
  recipes: Recipe[];
  actions: Action[];
}

export function RecipeList({ recipes, actions }: Props) {
  return (
    <Stack
      css={{
        [Breakpoint.TABLET]: { alignItems: "center", width: "100%" },
        [Breakpoint.MOBILE]: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "stretch",
        },
      }}
    >
      {recipes.map((recipe) => {
        return (
          <RecipeCard
            recipe={recipe}
            key={recipe.slug}
            css={{
              marginBottom: 16,
              [Breakpoint.TABLET]: {
                marginBottom: 0,
              },
            }}
          >
            <Stack
              css={{
                fontSize: 36,
                marginLeft: 42,
                color: "grey",
                height: "100%",
                [Breakpoint.TABLET_ONLY]: {
                  marginLeft: 16,
                  flexDirection: "row",
                  width: 100,
                },

                [Breakpoint.MOBILE]: {
                  margin: "auto",
                  flexDirection: "row",
                  width: "66%",
                },
              }}
            >
              {actions.map((action, idx) => (
                <IconButton
                  key={idx}
                  icon={action.icon}
                  onClick={action.onClick(recipe)}
                  css={{ margin: "auto" }}
                />
              ))}
            </Stack>
          </RecipeCard>
        );
      })}
    </Stack>
  );
}
