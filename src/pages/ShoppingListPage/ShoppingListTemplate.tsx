import React from "react";
import Ingredient from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { PantryIngredientCard } from "../../components/organisms/PantryIngredientCard";
import { Flex } from "../../components/atoms/Flex";
interface Props {
  ingredients: Ingredient[];
}

export function ShoppingListTemplate({ ingredients }: Props) {
  return (
    <Stack css={{ margin: "auto" }}>
      <h1>Shopping List</h1>
      <Flex css={{ flexWrap: "wrap", maxWidth: 800 }}>
        {ingredients.map((ingredient) => (
          <PantryIngredientCard ingredient={ingredient} />
        ))}
      </Flex>
    </Stack>
  );
}
