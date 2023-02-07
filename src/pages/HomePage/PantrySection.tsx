import { Stack } from "components/atoms/Stack";
import React from "react";
import { IngredientList } from "../../components/organisms/IngredientList";
import Ingredient from "../../data/ingredients";

interface Props {
  pantry?: Ingredient[];
}

export default function PantrySection({ pantry }: Props) {
  return (
    <Stack css={{ maxWidth: 352 }}>
      <h2>Pantry</h2>
      <IngredientList ingredients={pantry} />
    </Stack>
  );
}
