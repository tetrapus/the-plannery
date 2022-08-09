import {
  faCheck,
  faMinus,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useState } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { MealPlan, MealPlanItem } from "../../data/meal-plan";
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
import { Breakpoint } from "../../components/styles/Breakpoint";
import reorder from "animations/reorder.json";
import prepare from "animations/prepare.json";
import { AnimatedIconButton } from "../../components/atoms/AnimatedIconButton";
import firebase from "firebase";
import { Link } from "react-router-dom";

interface Props {
  mealPlan: MealPlan;
  recipes?: Recipe[];
}

function assertNever(): never {
  throw new Error();
}

export function MealPlanSection({ mealPlan, recipes }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const pantry = useContext(PantryContext);
  const [mode, setMode] = useState<"reorder" | undefined>();

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

    const pantryItems = recipe.ingredients.map((ingredient) => {
      const pantryItem = pantry.items.find((item) =>
        isSameIngredient(item.ingredient, ingredient)
      );
      return { ingredient, pantryItem };
    });
    const pantryCollectionItems = pantryItems.filter(
      ({ pantryItem }) => pantryItem && pantryItem.ref
    );
    const pantryBlobItems = pantryItems.filter(
      ({ pantryItem }) => !pantryItem || !pantryItem.ref
    );

    const batch = db.batch();
    if (pantryCollectionItems.length) {
      pantryCollectionItems.forEach(({ ingredient, pantryItem }) => {
        if (!pantryItem?.ref) {
          assertNever();
        }
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
    }

    if (pantryBlobItems.length && household) {
      const blobDelta = {} as { [key: string]: { [key: string]: any } };
      pantryBlobItems.forEach(({ ingredient, pantryItem }) => {
        if (pantryItem && pantryItem.ingredient.qty && ingredient.qty) {
          if (!blobDelta[ingredient.type.id]) {
            blobDelta[ingredient.type.id] = {};
          }
          if (pantryItem.ingredient.qty > ingredient.qty) {
            blobDelta[ingredient.type.id][JSON.stringify(ingredient.unit)] = {
              ingredient: {
                ...pantryItem.ingredient,
                qty: pantryItem.ingredient.qty - ingredient.qty,
              },
              ...insertMeta,
            };
          } else {
            blobDelta[ingredient.type.id][JSON.stringify(ingredient.unit)] =
              firebase.firestore.FieldValue.delete();
          }
        }
      });
      batch.set(household.ref.collection("blobs").doc("pantry"), blobDelta, {
        merge: true,
      });
    }

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

  const queuedRecipes = mealPlan.recipes
    .filter((item) => item.order)
    .sort((a, b) => (a.order as number) - (b.order as number));

  const sections: { [plan: string]: MealPlanItem[] } = {
    ...(queuedRecipes.length ? { "Queued Recipes": queuedRecipes } : {}),
    ...Object.fromEntries(
      plans.map((plan) => {
        return [
          plans.length === 1 || plan !== household?.planId ? "Planned" : "",
          mealPlan.recipes.filter(
            (mealPlanItem) =>
              (mealPlanItem.planId || 0) === plan && !mealPlanItem.order
          ),
        ];
      })
    ),
  };

  return (
    <>
      <Flex css={{ width: "100%" }}>
        <h1
          css={{
            marginLeft: 8,
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Your meal plan
          {!mode ? (
            <AnimatedIconButton
              animation={reorder}
              iconSize={40}
              onClick={() => setMode("reorder")}
            />
          ) : null}
          {mealPlan.recipes && (
            <Link to="/prep">
              <AnimatedIconButton animation={prepare} iconSize={40} />
            </Link>
          )}
        </h1>
        {!mode ? (
          <>
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
          </>
        ) : (
          <TextButton
            css={{ margin: "auto", marginRight: 8 }}
            onClick={() => setMode(undefined)}
          >
            Done
          </TextButton>
        )}
      </Flex>
      <Stack>
        {Object.entries(sections).map(([plan, planRecipes]) => {
          return (
            <div
              key={plan}
              css={{
                borderTop: "1px solid #dedede",
                [Darkmode]: {
                  borderTop: "1px solid #333",
                },
                paddingTop: 24,
                marginTop: 8,
                [Breakpoint.TABLET]: {
                  paddingTop: 8,
                },
              }}
            >
              {plan && (
                <div
                  css={{
                    position: "absolute",
                    transform: "translateY(-36px)",
                    [Breakpoint.TABLET]: {
                      transform: "translateY(-22px)",
                    },
                    display: "inline-block",
                    padding: "2px 4px",
                    background: "#f5f5f5",
                    [Darkmode]: {
                      background: "#222",
                    },
                  }}
                >
                  {plan}
                </div>
              )}
              {!planRecipes.length && plan === "" ? (
                <Stack
                  css={{
                    margin: 8,
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23c0c0c0' stroke-width='3' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                    [Darkmode]: {
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23000' stroke-width='3' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                    },
                    padding: "0 16px 24px 16px",
                    alignItems: "center",
                    borderRadius: 8,
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
              ) : (
                <RecipeList
                  recipes={planRecipes
                    .map((mealPlanItem) =>
                      getRecipe(recipes, mealPlanItem.slug)
                    )
                    .filter((x): x is Recipe => x !== undefined)}
                  dismiss={
                    mode === "reorder"
                      ? plan === "Queued Recipes"
                        ? {
                            icon: faMinus,
                            onClick: (recipe) => (e) => {
                              mealPlan.recipes
                                .find(
                                  (mealPlanItem) =>
                                    mealPlanItem.slug === recipe.slug
                                )
                                ?.ref.set(
                                  {
                                    order:
                                      firebase.firestore.FieldValue.delete(),
                                  },
                                  { merge: true }
                                );
                              e.preventDefault();
                            },
                          }
                        : undefined
                      : {
                          icon: faTimes,
                          onClick: (recipe) => (e) => {
                            mealPlan.recipes
                              .find(
                                (mealPlanItem) =>
                                  mealPlanItem.slug === recipe.slug
                              )
                              ?.ref.delete();
                            e.preventDefault();
                          },
                        }
                  }
                  select={
                    mode === "reorder"
                      ? plan !== "Queued Recipes"
                        ? {
                            icon: faPlus,
                            onClick: (recipe) => (e) => {
                              mealPlan.recipes
                                .find(
                                  (mealPlanItem) =>
                                    mealPlanItem.slug === recipe.slug
                                )
                                ?.ref.set(
                                  {
                                    order:
                                      Math.max(
                                        0,
                                        ...mealPlan.recipes.map(
                                          (recipe) => recipe.order || 0
                                        )
                                      ) + 1,
                                  },
                                  { merge: true }
                                );
                              e.preventDefault();
                            },
                          }
                        : undefined
                      : {
                          icon: faCheck,
                          onClick: (recipe) => (e) => {
                            household?.ref
                              .collection("history")
                              .add({ ...insertMeta, slug: recipe.slug });
                            onClose(recipe);
                            mealPlan.recipes
                              .find(
                                (mealPlanItem) =>
                                  mealPlanItem.slug === recipe.slug
                              )
                              ?.ref.delete();
                            e.preventDefault();
                          },
                        }
                  }
                ></RecipeList>
              )}
            </div>
          );
        })}
      </Stack>
    </>
  );
}
