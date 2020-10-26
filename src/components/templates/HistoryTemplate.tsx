import React from "react";
import { RecipeHistory } from "../../data/recipe-history";

interface Props {
  history: RecipeHistory;
}

export function HistoryTemplate({ history }: Props) {
  return <>{history.history.map((item) => item.slug)}</>;
}
