import React from "react";
import HomeTemplate from "../components/templates/HomeTemplate";
import { getSuggestedRecipes } from "../data/recipes";

export default function HomePage() {
  const recipes = getSuggestedRecipes();
  return <HomeTemplate recipes={recipes}></HomeTemplate>;
}
