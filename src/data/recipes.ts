import SeedRandom from "seed-random";
import Ingredient from "../models/Ingredient";
import { IngredientType } from "../models/IngredientType";
import { Recipe } from "../models/Recipe";
import { RecipeStep } from "../models/RecipeStep";
import { ExternalCollectionFactory } from "./CollectionFactory";
import { normaliseIngredient } from "./ingredients";

export const RecipesCollection = ExternalCollectionFactory(
  "/recipe-data.json",
  []
);

export function getRecipes(): Recipe[] {
  return RecipesCollection.get()
    .filter(isValidRecipe)
    .map((item: any) => ({
      name: item.name,
      subtitle: item.headline,
      description: item.descriptionMarkdown,
      slug: item.slug,
      url: `https://www.hellofresh.com.au/recipes/${item.slug}-${item.id}`,
      imageUrl: item.imagePath
        ? `https://img.hellofresh.com/hellofresh_s3${item.imagePath}`
        : "https://source.unsplash.com/featured/?ingredients",
      ingredients: getIngredients(
        item.yields.find((yields: any) => yields.yields === 4)?.ingredients,
        item.ingredients
      ),
      steps: item.steps.map(getRecipeStep),
      utensils: item.utensils.map((utensil: any) => utensil.name),
      tags: [...item.cuisines, ...item.tags].map((tag) => tag.name),
    }));
}

const getWeek = function (date: Date) {
  const onejan: any = new Date(date.getFullYear(), 0, 1);
  const today: any = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const dayOfYear = (today - onejan + 86400000) / 86400000;
  return Math.ceil(dayOfYear / 7);
};

export function getSuggestedRecipes() {
  const recipes = getRecipes();
  const random = SeedRandom(
    `${getWeek(new Date())}:${new Date().getFullYear()}`
  );
  const randint = (x: number, y: number) =>
    Math.floor(random() * (y - x + 1) + x);
  const floyd = (list: any[], k: number) => {
    const result: number[] = [];
    const y = list.length;
    for (let i = 0; i < Math.min(k, y); i++) {
      const draw = randint(0, y - k + i + 1);
      if (result.includes(draw)) {
        result.push(y - k + i + 1);
      } else {
        result.push(draw);
      }
    }
    return result.map((idx) => list[idx]);
  };
  return floyd(recipes, 10);
}

export function getRecipe(slug: string) {
  const recipes = getRecipes();
  return recipes.find((recipe) => recipe.slug === slug);
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
  return ingredients.map((ingredient) =>
    normaliseIngredient({
      qty: ingredient.amount || 1,
      unit: ingredient.unit || "unit",
      type: getIngredientType(
        types.find((type) => type.id === ingredient.id)
      ) as IngredientType,
    })
  );
}

function getIngredientType(ingredient: any): IngredientType | undefined {
  if (!ingredient) {
    return {
      id: "unknown",
      name: "unknown",
      imageUrl: "#",
    };
  }
  return {
    id: ingredient.slug,
    name: ingredient.name,
    imageUrl: `https://img.hellofresh.com/hellofresh_s3${ingredient.imagePath}`,
  };
}
