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
import { Darkmode } from "components/styles/Darkmode";
import { Stack } from "components/atoms/Stack";

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

  const plans = [
    ...mealPlan.recipes.map((recipe) => recipe.planId || 0),
    household?.planId,
  ]
    .sort()
    .reduce(
      (prev, curr) =>
        prev.length && curr === prev[prev.length - 1] ? prev : [...prev, curr],
      [] as any[]
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
      <Stack>
        {plans.map((plan) => {
          const planRecipes = mealPlan.recipes.filter(
            (mealPlanItem) => (mealPlanItem.planId || 0) === plan
          );

          return (
            <div
              key={plan}
              css={{
                ":not(:last-child)": {
                  borderBottom: "1px solid #dedede",
                  [Darkmode]: {
                    borderBottom: "1px solid #000",
                  },
                },
              }}
            >
              {planRecipes.length ? (
                <RecipeList
                  recipes={planRecipes
                    .map((mealPlanItem) =>
                      getRecipe(recipes, mealPlanItem.slug)
                    )
                    .filter((x): x is Recipe => x !== undefined)}
                  dismiss={{
                    icon: faTimes,
                    onClick: (recipe) => (e) => {
                      mealPlan.recipes
                        .find(
                          (mealPlanItem) => mealPlanItem.slug === recipe.slug
                        )
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
                        .find(
                          (mealPlanItem) => mealPlanItem.slug === recipe.slug
                        )
                        ?.ref.delete();
                      e.preventDefault();
                    },
                  }}
                ></RecipeList>
              ) : (
                <Stack
                  css={{
                    margin: 8,
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23dedede' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                    [Darkmode]: {
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23000' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                    },
                    padding: "32px 48px",
                    alignItems: "center",
                  }}
                >
                  <h3>Get started on your next meal plan</h3>
                  <div>
                    <div>
                      <strong>1.</strong> Update your pantry with ingredients
                      you want to use
                    </div>
                    <div>
                      <strong>2.</strong> Shortlist some recipes
                    </div>
                    <div>
                      <strong>3.</strong> Buy your ingredients
                    </div>
                    <div>
                      <strong>4.</strong> Start cooking!
                    </div>
                  </div>
                </Stack>
              )}
            </div>
          );
        })}
      </Stack>
    </>
  );
}
