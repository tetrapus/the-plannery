import firebase from "firebase";
import SeedRandom from "seed-random";
import { ExternalCollectionFactory } from "./CollectionFactory";
import Ingredient, { IngredientType, normaliseIngredient } from "./ingredients";
import { Like } from "./likes";
import { enoughInPantry, PantryItem } from "./pantry";
import { HistoryItem } from "./recipe-history";
import { Trash } from "./trash";

export interface RecipeTimer {
  name: string;
  duration: number;
}
export interface RecipeStep {
  method: string;
  images: string[];
  ingredients: string[];
  timers: RecipeTimer[];
}

type Difficulty = "Easy" | "Moderate" | "Hard" | "Expert";

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
  serves: number;
  prepTime?: number;
  difficulty?: Difficulty;
}

export const RecipesCollection = ExternalCollectionFactory<any[] | undefined>(
  "https://firebasestorage.googleapis.com/v0/b/the-plannery.appspot.com/o/recipe-data.json?alt=media&token=a1514430-d46e-4e82-9112-765f243ed627",
  undefined
);

export function getRecipes(recipes: any[] | undefined): Recipe[] | undefined {
  if (recipes === undefined) {
    return undefined;
  }
  recipes = Object.values(
    Object.fromEntries(recipes.map((recipe) => [recipe.slug, recipe]))
  );

  return recipes.filter(isValidRecipe).map((item: any) => {
    let yields = item.yields.find((yields: any) => yields.yields === 4);
    if (!yields) {
      yields = item.yields[0];
    }

    const prepTime = item.prepTime && item.prepTime.match(/PT(\d+)M/);
    return {
      name: item.name,
      subtitle: item.headline,
      description: item.descriptionMarkdown,
      slug: item.slug,
      url: `https://www.hellofresh.com.au/recipes/${item.slug}-${item.id}`,
      imageUrl: item.imagePath
        ? `https://img.hellofresh.com/hellofresh_s3${item.imagePath}`
        : "https://source.unsplash.com/featured/?ingredients",
      ingredients: getIngredients(yields.ingredients, item.ingredients),
      serves: yields.yields,
      steps: item.steps.map(getRecipeStep),
      utensils: item.utensils.map((utensil: any) => utensil.name),
      tags: [...item.cuisines, ...item.tags].map((tag) => tag.name),
      prepTime: prepTime ? parseInt(prepTime[1]) : undefined,
      difficulty: (
        { 1: "Easy", 2: "Moderate", 3: "Hard" } as { [key: number]: Difficulty }
      )[item.difficulty as number],
    };
  });
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

export interface Preference {
  id: string;
  type:
    | "ingredient"
    | "tag"
    | "equipment"
    | "liked"
    | "trash"
    | "recent"
    // | "pantry";
    | "ready-to-cook" // replace with remaining cost & cost
    | "fast"
    | "easy";
  // moods
  preference: "exclude" | "reduce" | "prefer" | "require";
  pinned?: boolean;
  ref: firebase.firestore.DocumentReference;
}

interface PreferenceProcessor {
  match: (values: Set<Preference["id"]>, recipe: Recipe) => number;
}

function partitionBy<T extends { [key: string]: any }>(arr: T[], key: string) {
  return arr.reduce(
    (acc: { [key: string]: T[] }, value: T) => ({
      ...acc,
      [value[key]]: [...(acc[value[key]] || []), value],
    }),
    {} as { [key: string]: T[] }
  );
}

interface SuggestionFactors {
  likes: Like[];
  trash: Trash[];
  history: HistoryItem[];
  pantry: PantryItem[];
}

export const DEFAULT_PREFERENCES = [
  { id: "Liked recipes", type: "liked", preference: "prefer" },
  { id: "Ready to cook", type: "ready-to-cook", preference: "prefer" },
  { id: "Recently cooked", type: "recent", preference: "reduce" },
  { id: "Disliked recipes", type: "trash", preference: "exclude" },
];

export function getSuggestedRecipes(
  recipes: Recipe[] | undefined,
  preferences: Preference[] | undefined,
  sources: SuggestionFactors,
  limit: number = 12
) {
  if (recipes === undefined || preferences === undefined) {
    return undefined;
  }
  const random = SeedRandom(
    `${getWeek(new Date())}:${new Date().getFullYear()}`
  );

  let weightedRecipes = recipes.map((recipe) => ({
    recipe,
    roll: random(),
    score: 0,
    reasons: [],
  }));

  const processors: { [key: string]: PreferenceProcessor } = {
    ingredient: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        recipe.ingredients.find((ingredient) => values.has(ingredient.type.id))
          ? 1
          : 0,
    },
    tag: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        recipe.tags.find((tag) => values.has(tag)) ? 1 : 0,
    },
    equipment: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        recipe.utensils.find((tag) => values.has(tag)) ? 1 : 0,
    },
    liked: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        sources.likes.find((like) => like.slug === recipe.slug) ? 1 : 0,
    },
    trash: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        sources.trash.find((trash) => trash.slug === recipe.slug) ? 1 : 0,
    },
    recent: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        sources.history
          .filter(
            (item) =>
              Date.now() - item.created?.toMillis() < 1000 * 60 * 60 * 24 * 31
          )
          .find((item) => item.slug === recipe.slug)
          ? 1
          : 0,
    },
    "ready-to-cook": {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        recipe.ingredients.every((ingredient) => {
          const pantryItem = sources.pantry.find(
            (item) => item.ingredient.type.id === ingredient.type.id
          );
          return enoughInPantry(ingredient, pantryItem);
        })
          ? 1
          : 0,
    },
    easy: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        ({ Easy: 1, Moderate: 0.4, Hard: 0, Expert: 0 }[
          recipe.difficulty || "Moderate"
        ]),
    },
    fast: {
      match: (values: Set<Preference["id"]>, recipe: Recipe) =>
        recipe.prepTime ? Math.max((60 - recipe.prepTime) / 60, 0) : 0.5,
    },
  };

  const scorers: { [key: string]: (isMatch: number) => number | null } = {
    exclude: (isMatch) => (isMatch ? null : 0),
    reduce: (isMatch) => (isMatch ? -1 * isMatch : 0),
    prefer: (isMatch) => (isMatch ? 1 * isMatch : 0),
    require: (isMatch) => (isMatch ? 0 : null),
  };

  // Bucket first by action
  const preferenceActions = Object.entries(
    partitionBy(preferences, "preference")
  )
    .sort()
    .reverse();
  for (const [action, preferences] of preferenceActions) {
    const preferenceTypes = Object.entries(partitionBy(preferences, "type"));
    for (const [type, preferences] of preferenceTypes) {
      const values = new Set(preferences.map((preference) => preference.id));
      const processedRecipes = weightedRecipes.map((r) => {
        const isMatch = processors[type].match(values, r.recipe);
        const score = scorers[action](isMatch);
        if (score === null) {
          return undefined;
        }
        return { ...r, score: r.score + score };
      });
      weightedRecipes = processedRecipes.filter(
        (recipe) => recipe !== undefined
      ) as any;
    }
  }

  const maxScore = Math.max(...weightedRecipes.map((r) => r.score));
  const minScore = Math.min(...weightedRecipes.map((r) => r.score));

  const scoredRecipes = weightedRecipes.map(
    ({ recipe, score, roll, reasons }) => {
      return {
        recipe,
        score: roll + 0.4 * (score / (maxScore - minScore || 1)),
        reasons,
      };
    }
  );
  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ recipe, reasons }) => ({
      recipe,
      reasons,
    }));
}

export function getRecipe(recipes: Recipe[] | undefined, slug: string) {
  if (recipes === undefined) {
    return null;
  }
  return recipes.find((recipe) => recipe.slug === slug);
}

function isValidRecipe(recipe: any) {
  return (
    recipe.ingredients.length && recipe.steps.length && recipe.yields.length
  );
}

function getStepTimer(timer: any): RecipeTimer | undefined {
  if (!timer.duration.match(/PT\d+M/)) {
    return;
  }
  return {
    name: timer.name,
    duration: parseInt(timer.duration.match(/\d+/)[0]) * 60,
  };
}

function getRecipeStep(step: any): RecipeStep {
  return {
    method: step.instructionsMarkdown,
    images: (step.images || []).map(
      (stepImage: any) =>
        `https://img.hellofresh.com/hellofresh_s3${stepImage.path}`
    ),
    ingredients: step.ingredients,
    timers: step.timers
      .map((timer: any) => getStepTimer(timer))
      .filter((timer: any) => !!timer),
  };
}

function getIngredients(ingredients: any[], types: any[]): Ingredient[] {
  if (!ingredients) {
    return [];
  }
  return ingredients.map(
    (ingredient) =>
      normaliseIngredient({
        qty: ingredient.amount || 1,
        unit: ingredient.unit || "unit",
        type: getIngredientType(
          types.find((type) => type.id === ingredient.id)
        ) as IngredientType,
      }) as Ingredient
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
    imageUrl: ingredient.imagePath
      ? `https://img.hellofresh.com/hellofresh_s3${ingredient.imagePath}`
      : null,
  };
}
