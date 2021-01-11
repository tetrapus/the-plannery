import React, { useEffect, useMemo } from "react";
import "./App.css";
import { RecipePage } from "./pages/RecipePage/RecipePage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import NavigationBar from "./components/organisms/NavigationBar";
import firebase from "firebase";
import { db, initFirebase, useFirestore } from "./init/firebase";
import { AuthStateContext, Household } from "./data/auth-state";
import { Stack } from "./components/atoms/Stack";
import { Spinner } from "./components/atoms/Spinner";
import { LoggedOutTemplate } from "./components/templates/LoggedOutTemplate";
import { GetStartedTemplate } from "./components/templates/GetStartedTemplate";
import { Like, LikesContext } from "./data/likes";
import { PantryContext, PantryItem } from "./data/pantry";
import { HistoryPage } from "./pages/HistoryPage/HistoryPage";
import { ShoppingListPage } from "./pages/ShoppingListPage/ShoppingListPage";
import { useSubscription } from "./util/use-subscription";
import { Trash, TrashContext } from "./data/trash";
import ScrollToTop from "./util/ScrollToTop";

initFirebase();

function App() {
  const currentUser = useSubscription<firebase.User | null>((setState) =>
    firebase.auth().onAuthStateChanged((user) => setState(user))
  );

  const household = useFirestore<any, Household | null | undefined>(
    currentUser,
    (currentUser) =>
      currentUser
        ? db
            .collection("household")
            .where("members", "array-contains", currentUser.uid)
        : undefined,
    (querySnapshot) =>
      querySnapshot.docs.length
        ? ({
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
            ref: querySnapshot.docs[0].ref,
          } as Household)
        : null
  );

  useEffect(() => {
    if (!household || !currentUser) {
      return;
    }
    household.ref.collection("users").doc(currentUser.uid).set({
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid,
      email: currentUser.email,
    });
  }, [household, currentUser]);

  const authState = useMemo(
    () => ({
      loading: currentUser === undefined,
      currentUser: currentUser,
      household,
      insertMeta: {
        by: currentUser?.uid,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      },
    }),
    [currentUser, household]
  );

  const likes = useFirestore(
    household,
    (doc) => doc.ref.collection("likes"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as Like))
  );

  const trash = useFirestore(
    household,
    (doc) => doc.ref.collection("trash"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as Trash))
  );

  const pantry = useFirestore(
    household,
    (doc) => doc.ref.collection("pantry"),
    (snapshot) => ({
      items: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
      ),
    })
  );

  return (
    <AuthStateContext.Provider value={authState}>
      <LikesContext.Provider value={likes || []}>
        <TrashContext.Provider value={trash || []}>
          <PantryContext.Provider value={pantry}>
            <Router>
              <Stack css={{ minHeight: "100vh" }}>
                <ScrollToTop />
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
                    <Route path="/history">
                      <HistoryPage />
                    </Route>
                    <Route path="/shopping-list">
                      <ShoppingListPage />
                    </Route>
                    <Route path="/">
                      <HomePage></HomePage>
                    </Route>
                  </Switch>
                )}
              </Stack>
            </Router>
          </PantryContext.Provider>
        </TrashContext.Provider>
      </LikesContext.Provider>
    </AuthStateContext.Provider>
  );
}

export default App;
