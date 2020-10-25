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

  const pantryItem = pantry?.items.find((item) =>
    isSameIngredient(item.ingredient, ingredient)
  );
  if (!pantryItem) {
    return;
  }
  if (!pantryItem?.ingredient.qty) {
    return pantryItem;
  }
  if (!ingredient?.qty) {
    return pantryItem;
  }
  return !!pantryItem && pantryItem.ingredient.qty >= ingredient.qty
    ? pantryItem
    : undefined;
};
