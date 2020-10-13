import React from "react";
import "./App.css";
import { getRecipes } from "./data/recipes";
import { RecipePage } from "./pages/RecipePage";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/organisms/NavigationBar";

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar></NavigationBar>
        <Switch>
          <Route path="/recipes/:slug">
            <RecipePage></RecipePage>
          </Route>
          <Route path="/">
            <HomePage></HomePage>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
