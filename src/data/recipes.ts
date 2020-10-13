import Ingredient from "../models/Ingredient";
import { IngredientType } from "../models/IngredientType";
import { Recipe } from "../models/Recipe";
import { RecipeStep } from "../models/RecipeStep";
import recipeData from "./recipe-data.json";

export function getRecipes(): Recipe[] {
  return (recipeData as any).filter(isValidRecipe).map((item: any) => ({
    name: item.name,
    subtitle: item.headline,
    description: item.descriptionMarkdown,
    slug: item.slug,
    url: `https://www.hellofresh.com.au/recipes/${item.slug}-${item.id}`,
    imageUrl: item.imagePath
      ? `https://img.hellofresh.com/hellofresh_s3${item.imagePath}`
      : "https://source.unsplash.com/featured/?ingredients",
    ingredients: getIngredients(
      item.yields.find((yields: any) => yields.yields == 4)?.ingredients,
      item.ingredients
    ),
    steps: item.steps.map(getRecipeStep),
    utensils: item.utensils.map((utensil: any) => utensil.name),
    tags: [...item.cuisines, ...item.tags].map((tag) => tag.name),
  }));
}

export function getSuggestedRecipes() {
  const recipes = getRecipes();
  const randint = (x: number, y: number) =>
    Math.floor(Math.random() * (y - x + 1) + x);
  const floyd = (list: any[], k: number) => {
    const result: number[] = [];
    const y = list.length;
    for (let i = 0; i < k; i++) {
      const draw = randint(0, y - k + i + 1);
      if (result.includes(draw)) {
        result.push(y - k + i + 1);
      } else {
        result.push(draw);
      }
    }
    return result.map((idx) => list[idx]);
  };
  return floyd(recipes, 8);
}

export function getRecipe(slug: string) {
  const recipes = getRecipes();
  return recipes.find((recipe) => recipe.slug == slug);
}

function isValidRecipe(recipe: any) {
  return recipe.ingredients.length && recipe.steps.length;
}

function getRecipeStep(step: any): RecipeStep {
  return {
    method: step.instructionsMarkdown,
    images: (step.images || []).map(
      (stepImage: any) =>
        `https://img.hellofresh.com/hellofresh_s3${stepImage.path}`
    ),
  };
}

function getIngredients(ingredients: any[], types: any[]): Ingredient[] {
  if (!ingredients) {
    return [];
  }
  return ingredients.map((ingredient) => ({
    qty: ingredient.amount,
    unit: ingredient.unit,
    type: getIngredientType(
      types.find((type) => type.id == ingredient.id)
    ) as IngredientType,
  }));
}

function getIngredientType(ingredient: any): IngredientType | undefined {
  if (!ingredient) {
    return;
  }
  return {
    id: ingredient.slug,
    name: ingredient.family?.name || ingredient.name,
    imageUrl: `https://img.hellofresh.com/hellofresh_s3${ingredient.imagePath}`,
  };
}
