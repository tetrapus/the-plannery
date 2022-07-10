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

interface Props {}

interface Params {
  slug: string;
}

function makeSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/*
function ifType(value, transform) {
  return transform[typeof value](value);
}*/

export function RecipePage(props: Props) {
  const { slug } = useParams<Params>();
  const { hash } = useLocation();

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );
  let recipe: Recipe | null | undefined;
  if (slug === "new") {
    const value = JSON.parse(decodeURIComponent(hash.slice(1)));
    const author = value.author[0].name; /*ifType(value.author, {
      string: (author) => author.name,
      object: (authors) => authors.map((author) => author.name).join(", "),
    });*/
    recipe = {
      name: value.name,
      subtitle: `By ${author}`,
      description: value.description,
      slug: makeSlug(`${value.name}-${author}`),
      url: window.location.href,
      imageUrl: value.image[0], // todo: configurable
      ingredients: value.recipeIngredient.map((ingredient: string) => {
        const ingredientPattern =
          /^([0-9/.]+)\s*(tsp|tbsp|cup|gram|g|kg|oz|mg|l|litre)?[s]?[.]?\s+(.+)$/i;
        const match = ingredient.match(ingredientPattern);
        if (match) {
          let qty;
          if (match[1].match(/\//)) {
            const [numerator, denominator] = match[1].split("/");
            qty = parseFloat(numerator) / parseFloat(denominator);
          } else {
            qty = parseFloat(match[1]);
          }
          return {
            type: {
              id: makeSlug(match[3]),
              name: match[3],
              imageUrl: null,
            },
            qty,
            unit: match[2], // todo: normalize
          };
        } else {
          return {
            type: {
              id: makeSlug(ingredient),
              name: ingredient,
              imageUrl: null,
            },
            // qty: 1,
            // unit: 'unit',
          };
        }
      }),
      steps: value.recipeInstructions.map((step: any) => ({
        method: step.name ? `**${step.name}**\n\n${step.text}` : step.text,
        images: step.image ? [step.image] : [],
        ingredients: [],
        timers: [],
      })),
      utensils: [],
      tags: value.keywords,
      serves: parseInt(value.recipeYield),
      prepTime: parseInt(value.totalTime.match(/\d+/)[0]),
      difficulty: undefined,
    };
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
