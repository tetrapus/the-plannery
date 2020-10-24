import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { MealPlan } from "../../data/meal-plan";
import { getRecipe, Recipe } from "../../data/recipes";
import { RecipeList } from "./RecipeList";

interface Props {
  mealPlan: MealPlan;
}

export function MealPlanSection({ mealPlan }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);

  if (!mealPlan.recipes.length) {
    return null;
  }
  return (
    <>
      <h1>Your meal plan</h1>
      <RecipeList
        recipes={mealPlan.recipes
          .map((mealPlanItem) => getRecipe(mealPlanItem.slug))
          .filter((x): x is Recipe => x !== undefined)}
        actions={[
          {
            icon: faTimes,
            onClick: (recipe) => () =>
              mealPlan.recipes
                .find((mealPlanItem) => mealPlanItem.slug === recipe.slug)
                ?.ref.delete(),
          },
          {
            icon: faCheck,
            onClick: (recipe) => () => {
              household?.ref
                .collection("history")
                .add({ ...insertMeta, slug: recipe.slug });
              // TODO: Leftover UI
              mealPlan.recipes
                .find((mealPlanItem) => mealPlanItem.slug === recipe.slug)
                ?.ref.delete();
            },
          },
        ]}
      ></RecipeList>
    </>
  );
}
