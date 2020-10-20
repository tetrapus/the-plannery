import { IngredientType } from "./IngredientType";

export default interface Ingredient {
  type: IngredientType;
  qty?: number;
  unit?: string;
}
