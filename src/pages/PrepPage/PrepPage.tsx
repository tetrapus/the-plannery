import { useContext } from "react";
import { MealPlanContext } from "data/meal-plan";
import React from "react";
import { Stack } from "components/atoms/Stack";
import { Spinner } from "components/atoms/Spinner";
import { useSubscription } from "util/use-subscription";
import { getRecipes, Recipe, RecipesCollection } from "data/recipes";
import { RecipeStep } from "pages/RecipePage/RecipeStep/RecipeStep";
import { Link } from "react-router-dom";
import { Card } from "components/atoms/Card";
import { IngredientList } from "components/organisms/IngredientList";
import { Darkmode } from "components/styles/Darkmode";

const PREP_WORDS = new Set(
  `chop peel crush halve grate slice cut deseed bowl soak`.split(" ")
);

export function PrepPage() {
  const mealPlan = useContext(MealPlanContext);
  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );

  return (
    <Card css={{ maxWidth: 800, margin: "auto", marginTop: 8 }}>
      {mealPlan && recipes ? (
        mealPlan.recipes.map((plan) => {
          const recipe = recipes.find((recipe) => recipe.slug === plan.slug);

          const steps = recipe?.steps.filter((step) =>
            step.method
              .toLowerCase()
              .split(/[^a-zA-Z0-9]/)
              .some((word) => PREP_WORDS.has(word))
          );

          const ingredients = recipe?.ingredients.filter((ingredient) =>
            steps?.some((step) =>
              step.method
                .toLowerCase()
                .includes(ingredient.type.name.toLowerCase())
            )
          );
          return (
            <Stack
              key={plan.slug}
              css={{
                display: "grid",
                gridTemplateColumns: "16px auto 16px",
                gridTemplateRows: "repeat(3, auto)",
                borderBottom: "1px solid #dedede",
                [Darkmode]: {
                  borderBottom: "1px solid #444",
                },
              }}
            >
              <Link
                to={`/recipes/${plan.slug}`}
                css={{ gridArea: "1 / 2 / 2 / 3" }}
              >
                <h1>{recipe?.name}</h1>
              </Link>
              <IngredientList
                ingredients={ingredients}
                css={{
                  background: "#eeeeee",
                  gridArea: "2 / 1 / 3 / 4",
                  [Darkmode]: { background: "#333" },
                }}
              />
              <Stack css={{ gridArea: "3 / 2 / 4 / 3", marginTop: 8 }}>
                {steps?.map((step, idx) => (
                  <RecipeStep
                    recipeSlug={plan.slug}
                    step={step}
                    stepNumber={idx + 1}
                    ingredients={[]}
                    users={[]}
                  />
                ))}
              </Stack>
            </Stack>
          );
        })
      ) : (
        <Spinner />
      )}
    </Card>
  );
}
