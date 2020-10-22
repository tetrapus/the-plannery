import React, { useContext } from "react";
import { Flex } from "../atoms/Flex";
import { IngredientCard } from "../molecules/IngredientCard";
import { css } from "@emotion/core";
import { Pantry } from "../../data/pantry";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { HouseholdContext } from "../../data/household";
import { AuthStateContext } from "../../data/auth-state";

interface Props {
  ingredients: Ingredient[];
  pantry: Pantry;
}

export function IngredientList({ ingredients, pantry }: Props) {
  const { ref } = useContext(HouseholdContext);
  const { currentUser } = useContext(AuthStateContext);

  const togglePantry = (inPantry: boolean, ingredient: Ingredient) => {
    if (!ref) {
      return;
    }
    if (inPantry) {
      ref
        .collection("pantry")
        .where("ingredient.type.id", "==", ingredient.type.id)
        .where("ingredient.unit", "==", ingredient.unit)
        .get()
        .then((v) => v.docs.forEach((doc) => doc.ref.delete()));
    } else {
      ref.collection("pantry").add({
        ingredient,
        by: currentUser.uid,
      });
    }
  };

  const inPantry = (ingredient: Ingredient) => {
    const pantryItem = pantry.items.find((item) =>
      isSameIngredient(item.ingredient, ingredient)
    );
    if (!pantryItem) {
      return false;
    }
    if (!pantryItem?.ingredient.qty) {
      return true;
    }
    if (!ingredient?.qty) {
      return false;
    }
    return !!pantryItem && pantryItem.ingredient.qty >= ingredient.qty;
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
              onClick={() => togglePantry(inPantry, ingredient)}
            ></IngredientCard>
          );
        })}
    </Flex>
  );
}
