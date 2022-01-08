import React, { useContext } from "react";
import { Flex } from "../atoms/Flex";
import { PantryIngredientCard } from "./PantryIngredientCard";
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
      css={{
        flexWrap: "wrap",
      }}
      {...rest}
    >
      {ingredients
        .map((ingredient) => ({
          ingredient,
          inPantry: inPantry(ingredient, pantry),
        }))
        .map((ingredient) => ({
          ...ingredient,
          isStaple: !!(
            ingredient.inPantry &&
            !ingredient.inPantry.ingredient.qty &&
            !ingredient.inPantry.ingredient.unit
          ),
          enoughInPantry: enoughInPantry(
            ingredient.ingredient,
            ingredient.inPantry
          ),
        }))
        .sort((a, b) =>
          a.isStaple === b.isStaple
            ? a.enoughInPantry === b.enoughInPantry
              ? sortKey
                ? sortKey(a.ingredient) - sortKey(b.ingredient)
                : a.ingredient.type.name.localeCompare(b.ingredient.type.name)
              : a.enoughInPantry
              ? 1
              : -1
            : a.isStaple
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
