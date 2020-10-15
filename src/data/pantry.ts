import Ingredient from "../models/Ingredient";
import { CollectionFactory } from "./CollectionFactory";

export interface Pantry {
  items: Ingredient[];
}

export const PantryCollection = CollectionFactory<Pantry>("pantry", {
  items: [],
});
