import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { MealPlan } from "../../data/meal-plan";
import { PantryContext } from "../../data/pantry";
import { getRecipe, Recipe } from "../../data/recipes";
import { RecipeList } from "../../components/organisms/RecipeList";
import { isSameIngredient } from "../../data/ingredients";
import { db } from "../../init/firebase";
import { Spinner } from "../../components/atoms/Spinner";
import { TextButton } from "components/atoms/TextButton";
import { Flex } from "components/atoms/Flex";

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

  const showNewPlanButton = mealPlan.recipes.every(
    (recipe) => (recipe.planId || null) === (household?.planId || null)
  );

  return (
    <>
      <Flex css={{ width: "100%" }}>
        <h1 css={{ marginLeft: 8, flexGrow: 1 }}>Your meal plan </h1>
        {showNewPlanButton ? (
          <TextButton
            css={{ margin: "auto", marginRight: 8 }}
            onClick={() => {
              household?.ref.set(
                { planId: (household?.planId || 0) + 1 },
                { merge: true }
              );
            }}
          >
            Start a New Plan
          </TextButton>
        ) : null}
      </Flex>
      <RecipeList
        recipes={mealPlan.recipes
          .map((mealPlanItem) => getRecipe(recipes, mealPlanItem.slug))
          .filter((x): x is Recipe => x !== undefined)}
        dismiss={{
          icon: faTimes,
          onClick: (recipe) => (e) => {
            mealPlan.recipes
              .find((mealPlanItem) => mealPlanItem.slug === recipe.slug)
              ?.ref.delete();
            e.preventDefault();
          },
        }}
        select={{
          icon: faCheck,
          onClick: (recipe) => (e) => {
            household?.ref
              .collection("history")
              .add({ ...insertMeta, slug: recipe.slug });
            onClose(recipe);
            mealPlan.recipes
              .find((mealPlanItem) => mealPlanItem.slug === recipe.slug)
              ?.ref.delete();
            e.preventDefault();
          },
        }}
      ></RecipeList>
    </>
  );
}
