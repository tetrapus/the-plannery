import { SidePanel } from "components/molecules/SidePanel";
import { IngredientList } from "components/organisms/IngredientList";
import Ingredient from "data/ingredients";
import React from "react";

interface Props {
  pantry?: Ingredient[];
}

export default function PantrySection({ pantry }: Props) {
  return (
    <SidePanel
      css={{ maxWidth: 382, zIndex: 0, height: "unset", minHeight: "100vh" }}
    >
      <h2 css={{ marginLeft: 16 }}>Pantry</h2>
      <IngredientList ingredients={pantry} />
    </SidePanel>
  );
}
