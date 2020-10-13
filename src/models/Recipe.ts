import Ingredient from "./Ingredient";
import { RecipeStep } from "./RecipeStep";

export interface Recipe {
  name: string;
  subtitle: string;
  description: string;
  slug: string;
  url: string;
  imageUrl: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  utensils: string[];
  tags: string[];
}
