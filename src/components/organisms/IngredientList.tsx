import React, { useContext } from "react";
import { Flex } from "../atoms/Flex";
import { IngredientCard } from "../molecules/IngredientCard";
import { css } from "@emotion/core";
import { inPantry, PantryContext, PantryItem } from "../../data/pantry";
import Ingredient from "../../data/ingredients";
import { AuthStateContext } from "../../data/auth-state";
import { Spinner } from "../atoms/Spinner";

interface Props {
  ingredients?: Ingredient[];
  [key: string]: any;
}

export function IngredientList({ ingredients, ...rest }: Props) {
  const { currentUser, household } = useContext(AuthStateContext);
  const pantry = useContext(PantryContext);

  if (ingredients === undefined) {
    return <Spinner />;
  }

  const togglePantry = async (
    pantryItem: PantryItem | null | undefined,
    ingredient: Ingredient
  ) => {
    if (!household?.ref || pantryItem === null) {
      return;
    }
    if (pantryItem?.ref) {
      await pantryItem.ref.delete();
    } else {
      await household.ref.collection("pantry").add({
        ingredient,
        by: currentUser.uid,
      });
    }
  };

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
          !!a.inPantry === !!b.inPantry
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
              pantryItem={inPantry}
              onClick={() => togglePantry(inPantry, ingredient)}
            ></IngredientCard>
          );
        })}
    </Flex>
  );
}
