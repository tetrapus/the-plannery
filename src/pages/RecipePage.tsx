import React from "react";
import { useParams } from "react-router-dom";
import RecipeTemplate from "../components/templates/RecipeTemplate";
import { NotFoundTemplate } from "../components/templates/NotFoundTemplate";
import {
  getRecipe,
  getRecipes,
  Recipe,
  RecipesCollection,
} from "../data/recipes";
import { Spinner } from "../components/atoms/Spinner";
import { useSubscription } from "../util/use-subscription";

interface Props {}

interface Params {
  slug: string;
}

export function RecipePage(props: Props) {
  const { slug } = useParams<Params>();

  const recipes = useSubscription<Recipe[]>((setState) =>
    RecipesCollection.subscribe((value) => setState(getRecipes(value)))
  );
  const recipe = getRecipe(recipes, slug);

  if (recipe === null) {
    return <Spinner></Spinner>;
  } else if (recipe) {
    return <RecipeTemplate recipe={recipe}></RecipeTemplate>;
  }
  return <NotFoundTemplate></NotFoundTemplate>;
}
