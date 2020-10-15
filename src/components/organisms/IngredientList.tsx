import React, { useEffect, useState } from "react";
import Ingredient from "../../models/Ingredient";
import { Flex } from "../atoms/Flex";
import { IngredientCard } from "../molecules/IngredientCard";
import { css } from "@emotion/core";
import { PantryCollection } from "../../data/pantry";
import { isSameIngredient } from "../../data/ingredients";

interface Props {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: Props) {
  const [pantry, setPantry] = useState(PantryCollection.initialState);
  useEffect(() => PantryCollection.subscribe(setPantry), []);
  const addToPantry = (inPantry: boolean, ingredient: Ingredient) => {
    if (inPantry) {
      PantryCollection.set({
        items: [
          ...PantryCollection.get().items.filter(
            (pantryItem) => !isSameIngredient(pantryItem, ingredient)
          ),
        ],
      });
    } else {
      PantryCollection.set({
        items: [
          ...PantryCollection.get().items.filter(
            (pantryItem) => !isSameIngredient(pantryItem, ingredient)
          ),
          ingredient,
        ],
      });
    }
  };

  const inPantry = (ingredient: Ingredient) => {
    const pantryItem = pantry.items.find((item) =>
      isSameIngredient(item, ingredient)
    );
    return !!pantryItem && pantryItem.qty >= ingredient.qty;
  };

  return (
    <Flex
      css={css`
        flex-wrap: wrap;
        padding: 24px;
      `}
    >
      {ingredients
        .map((ingredient) => ({ ingredient, inPantry: inPantry(ingredient) }))
        .sort((a, b) =>
          a.inPantry === b.inPantry
            ? a.ingredient.type.name.localeCompare(b.ingredient.type.name)
            : a.inPantry
            ? 1
            : -1
        )
        .map(({ ingredient, inPantry }) => {
          return (
            <IngredientCard
              key={JSON.stringify(ingredient)}
              ingredient={ingredient}
              inPantry={inPantry}
              onClick={() => addToPantry(inPantry, ingredient)}
            ></IngredientCard>
          );
        })}
    </Flex>
  );
}
