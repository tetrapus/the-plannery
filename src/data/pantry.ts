import Ingredient from "./ingredients";

export interface PantryItem {
  ref: firebase.firestore.DocumentReference;
  ingredient: Ingredient;
  by: string;
}

export interface Pantry {
  items: PantryItem[];
}
