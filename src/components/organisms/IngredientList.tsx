import React, { useContext } from "react";
import { Flex } from "../atoms/Flex";
import { IngredientCard } from "../molecules/IngredientCard";
import { css } from "@emotion/core";
import { Pantry } from "../../data/pantry";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { AuthStateContext } from "../../data/auth-state";

interface Props {
  ingredients: Ingredient[];
  pantry?: Pantry;
}

export function IngredientList({ ingredients, pantry }: Props) {
  const { currentUser, household } = useContext(AuthStateContext);

  const togglePantry = (
    pantryRef: firebase.firestore.DocumentReference | undefined,
    ingredient: Ingredient
  ) => {
    if (!household?.ref) {
      return;
    }
    if (pantryRef) {
      pantryRef.delete();
    } else {
      household.ref.collection("pantry").add({
        ingredient,
        by: currentUser.uid,
      });
    }
  };

  const inPantry = (ingredient: Ingredient) => {
    const pantryItem = pantry?.items.find((item) =>
      isSameIngredient(item.ingredient, ingredient)
    );
    if (!pantryItem) {
      return;
    }
    if (!pantryItem?.ingredient.qty) {
      return pantryItem.ref;
    }
    if (!ingredient?.qty) {
      return pantryItem.ref;
    }
    return !!pantryItem && pantryItem.ingredient.qty >= ingredient.qty
      ? pantryItem.ref
      : undefined;
  };

  return (
    <Flex
      css={css`
        flex-wrap: wrap;
      `}
    >
      {ingredients
        .map((ingredient) => ({ ingredient, inPantry: inPantry(ingredient) }))
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
              pantryRef={inPantry}
              onClick={() => togglePantry(inPantry, ingredient)}
            ></IngredientCard>
          );
        })}
    </Flex>
  );
}
