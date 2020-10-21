import Ingredient from "../models/Ingredient";

export interface PantryItem {
  ref: firebase.firestore.DocumentReference;
  ingredient: Ingredient;
  by: string;
}

export interface Pantry {
  items: PantryItem[];
}
