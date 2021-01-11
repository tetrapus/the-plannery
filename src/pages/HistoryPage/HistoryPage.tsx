import React from "react";
import { Spinner } from "../../components/atoms/Spinner";
import { HistoryTemplate } from "./HistoryTemplate";
import { useHouseholdCollection } from "../../data/auth-state";
import { RecipeHistory, HistoryItem } from "../../data/recipe-history";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { useSubscription } from "../../util/use-subscription";

export function HistoryPage() {
  const history = useHouseholdCollection<RecipeHistory>(
    (doc) => doc.collection("history"),
    (snapshot) => ({
      history: snapshot.docs.map((doc) => ({
        ...(doc.data() as HistoryItem),
        ref: doc.ref,
      })),
    })
  );
  const recipes = useSubscription<Recipe[]>((setRecipes) =>
    RecipesCollection.subscribe((recipes) => setRecipes(getRecipes(recipes)))
  );
  if (!history || recipes === undefined) return <Spinner />;
  return <HistoryTemplate history={history} recipes={recipes} />;
}
