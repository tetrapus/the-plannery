import React from "react";
import { Switch, Route } from "react-router-dom";
import { BrowsePage } from "./BrowsePage/BrowsePage";
import { HistoryPage } from "./HistoryPage/HistoryPage";
import HomePage from "./HomePage/HomePage";
import { PantryPage } from "./PantryPage";
import { PrepPage } from "./PrepPage/PrepPage";
import { RecipePage } from "./RecipePage/RecipePage";
import { ShoppingListPage } from "./ShoppingListPage/ShoppingListPage";

export function Planner() {
  return (
    <Switch>
      <Route path="/recipes/:slug">
        <RecipePage />
      </Route>
      <Route path="/history">
        <HistoryPage />
      </Route>
      <Route path="/shopping-list">
        <ShoppingListPage />
      </Route>
      <Route path="/browse">
        <BrowsePage />
      </Route>
      <Route path="/prep">
        <PrepPage />
      </Route>
      <Route path="/pantry">
        <PantryPage />
      </Route>
      <Route path="/">
        <HomePage />
      </Route>
    </Switch>
  );
}
