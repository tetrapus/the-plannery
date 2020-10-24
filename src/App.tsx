import React, { useEffect, useState } from "react";
import "./App.css";
import { RecipePage } from "./pages/RecipePage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/organisms/NavigationBar";
import firebase from "firebase";
import { db, initFirebase } from "./init/firebase";
import { AuthStateContext, Household } from "./data/auth-state";
import { Stack } from "./components/atoms/Stack";
import { Spinner } from "./components/atoms/Spinner";
import { LoggedOutTemplate } from "./components/templates/LoggedOutTemplate";
import { GetStartedTemplate } from "./components/templates/GetStartedTemplate";
import { Like, LikesContext } from "./data/likes";

interface State {
  currentUser?: any;
  household?: Household | null;
}

initFirebase();

function App() {
  const [{ currentUser, household }, setState] = useState<State>({});
  const [likes, setLikes] = useState<Like[]>([]);

  useEffect(
    () =>
      firebase
        .auth()
        .onAuthStateChanged((user) =>
          setState((state) => ({ ...state, currentUser: user }))
        ),

    []
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    return db
      .collection("household")
      .where("members", "array-contains", currentUser?.uid)
      .onSnapshot((querySnapshot) => {
        const household = querySnapshot.docs.length
          ? ({
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
              ref: querySnapshot.docs[0].ref,
            } as Household)
          : null;
        setState((state) => ({ ...state, household }));
      });
  }, [currentUser]);

  useEffect(() => {
    if (!household) {
      return;
    }
    household.ref.collection("users").doc(currentUser.uid).set({
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid,
      email: currentUser.email,
    });
  }, [household, currentUser]);

  useEffect(
    () =>
      household?.ref
        .collection("likes")
        .onSnapshot((snapshot) =>
          setLikes(
            snapshot.docs.map(
              (doc) => ({ ref: doc.ref, ...doc.data() } as Like)
            )
          )
        ),
    [household]
  );

  return (
    <AuthStateContext.Provider
      value={{
        loading: currentUser === undefined,
        currentUser: currentUser,
        household,
        insertMeta: {
          by: currentUser?.uid,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        },
      }}
    >
      <LikesContext.Provider value={likes}>
        <Router>
          <Stack css={{ minHeight: "100vh" }}>
            <NavigationBar></NavigationBar>
            {currentUser === undefined ? (
              <Spinner />
            ) : !currentUser ? (
              <LoggedOutTemplate />
            ) : !household ? (
              <GetStartedTemplate />
            ) : (
              <Switch>
                <Route path="/recipes/:slug">
                  <RecipePage></RecipePage>
                </Route>
                <Route path="/">
                  <HomePage></HomePage>
                </Route>
              </Switch>
            )}
          </Stack>
        </Router>
      </LikesContext.Provider>
    </AuthStateContext.Provider>
  );
}

export default App;
