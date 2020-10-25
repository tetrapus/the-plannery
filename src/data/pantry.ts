import { createContext } from "react";
import Ingredient, { isSameIngredient } from "./ingredients";

export interface PantryItem {
  ref: firebase.firestore.DocumentReference;
  ingredient: Ingredient;
  by: string;
}

export interface Pantry {
  items: PantryItem[];
}

export const PantryContext = createContext<Pantry | undefined>(undefined);

export const inPantry = (ingredient: Ingredient, pantry?: Pantry) => {
  if (!pantry) {
    return null;
  }

  return pantry?.items.find((item) =>
    isSameIngredient(item.ingredient, ingredient)
  );
};

export function getRequiredQty(ingredient: Ingredient, pantryItem: PantryItem) {
  if (!pantryItem.ingredient.qty) {
    return undefined;
  }
  if (!ingredient.qty) {
    return Infinity;
  }
  return pantryItem.ingredient.qty >= ingredient.qty
    ? 0
    : pantryItem.ingredient.qty;
}
