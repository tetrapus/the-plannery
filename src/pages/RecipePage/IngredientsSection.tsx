import React from "react";
import { Flex } from "../../components/atoms/Flex";
import { IngredientList } from "../../components/organisms/IngredientList";
import Ingredient from "../../data/ingredients";
import { Recipe } from "../../data/recipes";
import { Session } from "../../data/session";
import IngredientChecklist from "./IngredientChecklist";

interface Props {
  recipe: Recipe;
  session?: Session;
}

export default function IngredientsSection({ recipe, session }: Props) {
  const sortKey = (ingredient: Ingredient) =>
    recipe.steps
      .map((step) => step.method)
      .join("\n")
      .toLowerCase()
      .indexOf(ingredient.type.name.toLowerCase());

  if (session) {
    return (
      <IngredientChecklist
        recipe={recipe}
        session={session}
        sortKey={sortKey}
      />
    );
  }
  return (
    <>
      <h2>Ingredients</h2>
      <Flex css={{ alignItems: "center" }}>
        <IngredientList
          ingredients={recipe.ingredients}
          sortKey={(ingredient: Ingredient) =>
            recipe.steps
              .map((step) => step.method)
              .join("\n")
              .toLowerCase()
              .indexOf(ingredient.type.name.toLowerCase())
          }
        />
      </Flex>
    </>
  );
}
