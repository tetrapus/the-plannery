import React from "react";
import { Link } from "react-router-dom";
import { RecipeCard } from "../molecules/RecipeCard";
import { Recipe } from "../../models/Recipe";
import { Stack } from "../atoms/Stack";

interface Props {
  recipes: Recipe[];
}

export default function HomeTemplate(props: Props) {
  return (
    <Stack css={{ maxWidth: 800, margin: "auto", placeItems: "flex-start" }}>
      <h1>Your meal plan</h1>
      <h1>Suggested for you</h1>
      {props.recipes.map((recipe) => (
        <Link key={recipe.slug} to={`/recipes/${recipe.slug}`}>
          <RecipeCard recipe={recipe}></RecipeCard>
        </Link>
      ))}
    </Stack>
  );
}
