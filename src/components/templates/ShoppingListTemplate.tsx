import React from "react";
import Ingredient from "../../data/ingredients";
import { Stack } from "../atoms/Stack";
import { PantryIngredientCard } from "../molecules/PantryIngredientCard";
interface Props {
  ingredients: Ingredient[];
}

export function ShoppingListTemplate({ ingredients }: Props) {
  return (
    <Stack css={{ margin: "auto" }}>
      <h1>Shopping List</h1>
      <Stack>
        {ingredients.map((ingredient) => (
          <PantryIngredientCard ingredient={ingredient} />
        ))}
      </Stack>
    </Stack>
  );
}
