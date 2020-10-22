import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { HouseholdContext } from "../../data/household";
import { AuthStateContext } from "../../data/auth-state";
import { Recipe } from "../../data/recipes";
import { MealPlan } from "../../data/meal-plan";
import { RecipeList } from "./RecipeList";

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
      <RecipeList
        recipes={suggestedRecipes}
        actions={[
          {
            icon: faPlus,
            onClick: (recipe) => () =>
              ref
                ?.collection("mealplan")
                .add({ slug: recipe.slug, by: currentUser.uid }),
          },
        ]}
      ></RecipeList>
    </div>
  );
}
