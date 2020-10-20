import React, { useEffect, useState } from "react";
import "./App.css";
import { RecipePage } from "./pages/RecipePage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/organisms/NavigationBar";
import firebase from "firebase";
import { initFirebase } from "./init/firebase";
import { AuthStateContext } from "./data/auth-state";
import { Stack } from "./components/atoms/Stack";

interface State {
  isSignedIn?: boolean;
}

initFirebase();

function App() {
  const [{ isSignedIn }, setState] = useState<State>({});
  useEffect(() =>
    firebase
      .auth()
      .onAuthStateChanged((user) => setState({ isSignedIn: !!user }))
  );

  return (
    <AuthStateContext.Provider
      value={{
        loading: isSignedIn === undefined,
        currentUser: firebase.auth().currentUser,
      }}
    >
      <Router>
        <Stack css={{ minHeight: "100vh" }}>
          <NavigationBar></NavigationBar>
          <Switch>
            <Route path="/recipes/:slug">
              <RecipePage></RecipePage>
            </Route>
            <Route path="/">
              <HomePage></HomePage>
            </Route>
          </Switch>
        </Stack>
      </Router>
    </AuthStateContext.Provider>
  );
}

export default App;
