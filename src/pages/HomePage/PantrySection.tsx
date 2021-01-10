import React from "react";
import { IngredientList } from "../../components/organisms/IngredientList";
import Ingredient from "../../data/ingredients";

interface Props {
  pantry?: Ingredient[];
}

export default function PantrySection({ pantry }: Props) {
  return (
    <>
      <h2>Pantry</h2>
      <IngredientList ingredients={pantry} />
    </>
  );
}
