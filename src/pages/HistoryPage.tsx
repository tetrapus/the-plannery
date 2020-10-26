import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "../components/atoms/Spinner";
import { HistoryTemplate } from "../components/templates/HistoryTemplate";
import { AuthStateContext } from "../data/auth-state";
import { RecipeHistory, HistoryItem } from "../data/recipe-history";
import { getRecipes, Recipe, RecipesCollection } from "../data/recipes";

export function HistoryPage() {
  const { household } = useContext(AuthStateContext);
  const [history, setHistory] = useState<RecipeHistory>();
  const [recipes, setRecipes] = useState<Recipe[]>();
  useEffect(
    () =>
      household?.ref.collection("history").onSnapshot((snapshot) =>
        setHistory({
          history: snapshot.docs.map((doc) => ({
            ...(doc.data() as HistoryItem),
            ref: doc.ref,
          })),
        })
      ),
    [household]
  );
  useEffect(
    () => RecipesCollection.subscribe((recipes) => setRecipes(getRecipes())),
    []
  );
  if (!history || recipes === undefined) return <Spinner />;
  return <HistoryTemplate history={history} />;
}
