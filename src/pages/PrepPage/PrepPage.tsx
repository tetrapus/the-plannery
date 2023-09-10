import { Card } from "components/atoms/Card";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { IngredientList } from "components/organisms/IngredientList";
import { Darkmode } from "components/styles/Darkmode";
import { MealPlanContext } from "data/meal-plan";
import { useRecipes } from "data/recipes";
import { RecipeStep } from "pages/RecipePage/RecipeStep/RecipeStep";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

const PREP_WORDS = new Set(
  `chop peel crush halve grate slice cut deseed bowl soak`.split(" ")
);

export function PrepPage() {
  const mealPlan = useContext(MealPlanContext);
  const recipes = useRecipes();

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
