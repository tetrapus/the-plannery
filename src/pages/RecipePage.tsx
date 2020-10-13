import React from "react";
import { useParams } from "react-router-dom";
import RecipeTemplate from "../components/templates/RecipeTemplate";
import { NotFoundTemplate } from "../components/templates/NotFoundTemplate";
import { getRecipe, getRecipes } from "../data/recipes";
import { Recipe } from "../models/Recipe";

interface Props {}

interface Params {
  slug: string;
}

export function RecipePage(props: Props) {
  const { slug } = useParams<Params>();
  const recipe = getRecipe(slug);
  if (recipe) {
    return <RecipeTemplate recipe={recipe}></RecipeTemplate>;
  }
  return <NotFoundTemplate></NotFoundTemplate>;
}
