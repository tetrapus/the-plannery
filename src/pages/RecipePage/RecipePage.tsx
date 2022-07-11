import React from "react";
import { useLocation, useParams } from "react-router-dom";
import RecipeTemplate from "./RecipeTemplate";
import { NotFoundTemplate } from "../../components/templates/NotFoundTemplate";
import {
  getRecipe,
  getRecipes,
  Recipe,
  RecipesCollection,
} from "../../data/recipes";
import { Spinner } from "../../components/atoms/Spinner";
import { useSubscription } from "../../util/use-subscription";
import Ingredient from "data/ingredients";

interface Props {}

interface Params {
  slug: string;
}

function makeSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function findObjects<T>(obj: any, type: string): T[] {
  if (Array.isArray(obj)) {
    return obj.flatMap((o) => findObjects(o, type));
  } else if (typeof obj === "object") {
    if ("@type" in obj && obj["@type"] === type) {
      return [obj];
    } else {
      return Object.values(obj).flatMap((value) => findObjects(value, type));
    }
  } else {
    return [];
  }
}

export function RecipePage(props: Props) {
  const { slug } = useParams<Params>();
  const { hash } = useLocation();

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );
  let recipe: Recipe | null | undefined;
  if (slug === "new") {
    if (recipes) {
      const ingredients: [Set<string>, Ingredient][] = Object.values(
        Object.fromEntries(
          recipes
            .flatMap((recipe) => recipe.ingredients)
            .map((ingredient) => [
              ingredient.type.id,
              [
                new Set(
                  ingredient.type.name
                    .replace(/(\(.*?\)|[^\sa-zA-Z])/g, "")
                    .toLowerCase()
                    .split(/\s+/)
                    .filter((x) => x.length)
                ),
                ingredient,
              ],
            ])
        )
      );

      const value = JSON.parse(decodeURIComponent(hash.slice(1)));
      try {
        const author = findObjects<{ name: string }>(value.author, "Person")
          .map((person) => person.name)
          .join(", ");
        recipe = {
          name: value.name,
          subtitle: `By ${author}`,
          description: value.description,
          slug: makeSlug(`${value.name}-${author}`),
          url: window.location.href,
          imageUrl: value.image[0], // todo: configurable
          ingredients: value.recipeIngredient.map((ingredient: string) => {
            const ingredientPattern =
              /^([0-9/.]+)\s*(tsp|tbsp|cup|gram|g|kg|oz|mg|ml|l|litre)?[s]?[.]?\s+(.+)$/i;
            const match = ingredient.match(ingredientPattern);
            let result: Ingredient;
            if (match) {
              let qty;
              if (match[1].match(/\//)) {
                const [numerator, denominator] = match[1].split("/");
                qty = parseFloat(numerator) / parseFloat(denominator);
              } else {
                qty = parseFloat(match[1]);
              }
              result = {
                type: {
                  id: makeSlug(match[3]),
                  name: match[3],
                  imageUrl: null,
                },
                qty,
                unit: match[2] || "unit", // todo: normalize
              };
            } else {
              result = {
                type: {
                  id: makeSlug(ingredient),
                  name: ingredient,
                  imageUrl: null,
                },
              };
            }
            const search = result.type.name
              .replace(/(\(.*?\)|[^\sa-zA-Z])/g, "")
              .toLowerCase()
              .split(/\s+/)
              .filter((x) => x.length);
            const terms = new Set(search);
            const matches = ingredients
              .map(
                ([key, ingredient]) =>
                  [
                    search.filter((term) => key.has(term)).length,
                    [...key.values()].filter((term) => terms.has(term)).length,
                    ingredient,
                  ] as [number, number, Ingredient]
              )
              .filter(([score]) => score > 0)
              .sort(([scoreA, tieBreakA, a], [scoreB, tieBreakB, b]) =>
                scoreA === scoreB ? tieBreakA - tieBreakB : scoreB - scoreA
              );
            console.log({ search, result, matches });
            if (matches.length) {
              result.type.imageUrl = matches[0][2].type.imageUrl;
              result.type.id = matches[0][2].type.id;
            }
            return result;
          }),
          steps: findObjects(value.recipeInstructions, "HowToStep").map(
            (step: any) => ({
              method:
                step.name && !step.text.startsWith(step.name)
                  ? `**${step.name}**\n\n${step.text}`
                  : step.text,
              images: step.image ? [step.image] : [],
              ingredients: [],
              timers: [],
            })
          ),
          utensils: [],
          tags:
            typeof value.keywords === "string"
              ? value.keywords.split(/,\s+/g)
              : value.keywords,
          serves: parseInt(value.recipeYield),
          prepTime: parseInt(value.totalTime.match(/\d+/)[0]),
          difficulty: undefined,
        };
      } catch {
        return <pre>{JSON.stringify(value, undefined, " ")}</pre>;
      }
    } else {
      recipe = null;
    }
  } else {
    recipe = getRecipe(recipes, slug);
  }

  if (recipe === null) {
    return <Spinner></Spinner>;
  } else if (recipe) {
    return <RecipeTemplate recipe={recipe}></RecipeTemplate>;
  }
  return <NotFoundTemplate></NotFoundTemplate>;
}
