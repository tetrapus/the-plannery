import { RecipeStep as RecipeStepT } from "../../data/recipes";
import Ingredient from "../../data/ingredients";

export interface RecipeEdits {
  title: string;
  subtitle: string;
  ingredients: Ingredient[];
  method: RecipeStepT[];
}
