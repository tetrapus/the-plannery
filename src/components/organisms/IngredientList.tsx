import React, { useContext } from "react";
import { Flex } from "../atoms/Flex";
import { PantryIngredientCard } from "../molecules/PantryIngredientCard";
import { css } from "@emotion/core";
import { enoughInPantry, inPantry, PantryContext } from "../../data/pantry";
import Ingredient from "../../data/ingredients";
import { Spinner } from "../atoms/Spinner";

interface Props {
  ingredients?: Ingredient[];
  sortKey?: (ingredient: Ingredient) => number;
  [key: string]: any;
}

export function IngredientList({ ingredients, sortKey, ...rest }: Props) {
  const pantry = useContext(PantryContext);

  if (ingredients === undefined) {
    return <Spinner />;
  }

  return (
    <Flex
      css={css`
        flex-wrap: wrap;
      `}
      {...rest}
    >
      {ingredients
        .map((ingredient) => ({
          ingredient,
          inPantry: inPantry(ingredient, pantry),
        }))
        .sort((a, b) =>
          enoughInPantry(a.ingredient, a.inPantry) ===
          enoughInPantry(b.ingredient, b.inPantry)
            ? sortKey
              ? sortKey(a.ingredient) - sortKey(b.ingredient)
              : a.ingredient.type.name.localeCompare(b.ingredient.type.name)
            : enoughInPantry(a.ingredient, a.inPantry)
            ? 1
            : -1
        )
        .map(({ ingredient, inPantry }) => {
          return (
            <PantryIngredientCard
              key={JSON.stringify(ingredient)}
              ingredient={ingredient}
              pantryItem={inPantry}
            ></PantryIngredientCard>
          );
        })}
    </Flex>
  );
}
