import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { Recipe } from "../../models/Recipe";
import { Flex } from "../atoms/Flex";
import { RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { MealPlan } from "../../models/MealPlan";
import { HouseholdContext } from "../../data/household";
import { AuthStateContext } from "../../data/auth-state";

interface Props {
  recipes: Recipe[];
  mealPlan: MealPlan;
}

export function SuggestedRecipesSection({ recipes, mealPlan }: Props) {
  const { ref } = useContext(HouseholdContext);
  const { currentUser } = useContext(AuthStateContext);
  const suggestedRecipes = recipes.filter(
    (recipe) => !mealPlan.recipes.find((r) => r.slug === recipe.slug)
  );
  if (!suggestedRecipes.length) {
    return null;
  }

  return (
    <div>
      <h1>Suggested for you</h1>
      {suggestedRecipes.map((recipe) => {
        return (
          <Flex>
            <RecipeCard key={recipe.slug} recipe={recipe} />
            <Stack css={{ fontSize: 36, margin: 42, color: "grey" }}>
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() =>
                  ref
                    ?.collection("mealplan")
                    .add({ slug: recipe.slug, by: currentUser.uid })
                }
              />
            </Stack>
          </Flex>
        );
      })}
    </div>
  );
}
