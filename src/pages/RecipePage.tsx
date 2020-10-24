import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RecipeTemplate from "../components/templates/RecipeTemplate";
import { NotFoundTemplate } from "../components/templates/NotFoundTemplate";
import { getRecipe, RecipesCollection } from "../data/recipes";
import { Spinner } from "../components/atoms/Spinner";

interface Props {}

interface Params {
  slug: string;
}

export function RecipePage(props: Props) {
  const { slug } = useParams<Params>();
  const initialState = {
    recipes: RecipesCollection.initialState,
  };
  const [, setState] = useState(initialState);
  useEffect(() => {
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
  }, []);
  const recipe = getRecipe(slug);

  if (recipe === null) {
    return <Spinner></Spinner>;
  } else if (recipe) {
    return <RecipeTemplate recipe={recipe}></RecipeTemplate>;
  }
  return <NotFoundTemplate></NotFoundTemplate>;
}
