import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Flex } from "../atoms/Flex";
import { RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { Recipe } from "../../data/recipes";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

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
    <>
      {recipes.map((recipe) => {
        return (
          <Flex key={recipe.slug}>
            <RecipeCard recipe={recipe}>
              <Stack css={{ fontSize: 36, margin: 42, color: "grey" }}>
                {actions.map((action, idx) => (
                  <FontAwesomeIcon
                    key={idx}
                    icon={action.icon}
                    onClick={action.onClick(recipe)}
                  />
                ))}
              </Stack>
            </RecipeCard>
          </Flex>
        );
      })}
    </>
  );
}
