import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { MealPlan } from "../../data/meal-plan";
import { PantryContext } from "../../data/pantry";
import { getRecipe, Recipe } from "../../data/recipes";
import { RecipeList } from "./RecipeList";
import { isSameIngredient } from "../../data/ingredients";
import { db } from "../../init/firebase";
import { Spinner } from "../atoms/Spinner";

interface Props {
  mealPlan: MealPlan;
  recipes?: Recipe[];
}

export function MealPlanSection({ mealPlan, recipes }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const pantry = useContext(PantryContext);

  if (!mealPlan.recipes.length) {
    return null;
  }

  if (!recipes) {
    return <Spinner />;
  }

  const onClose = (recipe: Recipe) => {
    if (!pantry) {
      return;
    }
    var batch = db.batch();
    recipe.ingredients.forEach((ingredient) => {
      const pantryItem = pantry.items.find((item) =>
        isSameIngredient(item.ingredient, ingredient)
      );
      if (pantryItem && pantryItem.ingredient.qty && ingredient.qty) {
        if (pantryItem.ingredient.qty > ingredient.qty) {
          batch.set(pantryItem.ref, {
            ingredient: {
              ...pantryItem.ingredient,
              qty: pantryItem.ingredient.qty - ingredient.qty,
            },
            ...insertMeta,
          });
        } else {
          batch.delete(pantryItem.ref);
        }
      }
    });
    batch.commit();
  };

  return (
    <>
      <h1>Your meal plan</h1>
      <RecipeList
        recipes={mealPlan.recipes
          .map((mealPlanItem) => getRecipe(recipes, mealPlanItem.slug))
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
              onClose(recipe);
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
