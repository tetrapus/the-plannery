import firebase from "firebase";
import { createContext } from "react";
import { Household } from "./auth-state";
import Ingredient, { ExpiryDate, isSameIngredient } from "./ingredients";

export interface PantryItem {
  ref?: firebase.firestore.DocumentReference;
  ingredient: Ingredient;
  expires?: ExpiryDate;
  by?: string;
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

export function deletePantryItem(household: Household, pantryItem: PantryItem) {
  if (pantryItem.ref) {
    return pantryItem.ref.delete();
  } else {
    return household.ref
      .collection("blobs")
      .doc("pantry")
      .set(
        {
          [pantryItem.ingredient.type.id]: {
            [JSON.stringify(pantryItem.ingredient.unit)]:
              firebase.firestore.FieldValue.delete(),
          },
        },
        { merge: true }
      );
  }
}

export function updatePantryItem(
  household: Household,
  pantryItem: PantryItem,
  insertMeta: { by?: string; created: firebase.firestore.FieldValue }
) {
  if (pantryItem.ref) {
    return pantryItem.ref.set({
      ingredient: {
        qty: pantryItem.ingredient.qty,
        type: pantryItem.ingredient.type,
        unit: pantryItem.ingredient.unit,
      },
      ...insertMeta,
    });
  } else {
    return household.ref
      .collection("blobs")
      .doc("pantry")
      .set(
        {
          [pantryItem.ingredient.type.id]: {
            [JSON.stringify(pantryItem.ingredient.unit)]: {
              ingredient: {
                qty: pantryItem.ingredient.qty,
                type: pantryItem.ingredient.type,
                unit: pantryItem.ingredient.unit,
              },
              ...insertMeta,
            },
          },
        },
        { merge: true }
      );
  }
}
