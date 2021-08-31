import firebase from "firebase";
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

export function enoughInPantry(
  ingredient: Ingredient,
  pantryItem?: PantryItem | null
) {
  return !!(
    pantryItem &&
    (!pantryItem.ingredient.qty ||
      (ingredient.qty && pantryItem.ingredient.qty >= ingredient.qty))
  );
}
