import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { Recipe } from "../../data/recipes";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Breakpoint } from "../styles/Breakpoint";

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
    <Stack css={{ [Breakpoint.TABLET]: { alignItems: "center" } }}>
      {recipes.map((recipe) => {
        return (
          <RecipeCard
            recipe={recipe}
            key={recipe.slug}
            css={{
              marginBottom: 16,
              [Breakpoint.TABLET_ONLY]: {
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
                [Breakpoint.MOBILE]: { margin: 8 },
              }}
            >
              {actions.map((action, idx) => (
                <FontAwesomeIcon
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
