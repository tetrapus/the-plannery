import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { MealPlanCollection } from "../../data/meal-plan";
import { Recipe } from "../../models/Recipe";
import { Flex } from "../atoms/Flex";
import { RecipeCard } from "../molecules/RecipeCard";

interface Props {
  recipes: Recipe[];
  mealPlan: string[];
}

export function SuggestedRecipesSection({ recipes, mealPlan }: Props) {
  const suggestedRecipes = recipes.filter(
    (recipe) => !mealPlan.find((r) => r === recipe.slug)
  );
  if (!suggestedRecipes) {
    return null;
  }
  return (
    <div>
      <h1>Suggested for you</h1>
      {suggestedRecipes.map((recipe) => (
        <Flex>
          <RecipeCard key={recipe.slug} recipe={recipe} />
          <FontAwesomeIcon
            icon={faPlus}
            css={{ fontSize: 36, margin: 42, color: "grey" }}
            onClick={() =>
              MealPlanCollection.set({
                recipes: [...mealPlan, recipe.slug],
              })
            }
          />
        </Flex>
      ))}
    </div>
  );
}
