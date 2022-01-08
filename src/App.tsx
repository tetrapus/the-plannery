import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import NavigationBar from "./components/organisms/NavigationBar";
import firebase from "firebase";
import {
  db,
  initFirebase,
  useFirestore,
  useFirestoreDoc,
} from "./init/firebase";
import { AuthStateContext, Household } from "./data/auth-state";
import { Stack } from "./components/atoms/Stack";
import { Spinner } from "./components/atoms/Spinner";
import { LoggedOutTemplate } from "./components/templates/LoggedOutTemplate";
import { GetStartedTemplate } from "./components/templates/GetStartedTemplate";
import { Like, LikesContext } from "./data/likes";
import { PantryContext, PantryItem } from "./data/pantry";
import { useSubscription } from "./util/use-subscription";
import { Trash, TrashContext } from "./data/trash";
import ScrollToTop from "./util/ScrollToTop";
import { Planner } from "pages/Planner";
import { MealPlan, MealPlanContext, MealPlanItem } from "data/meal-plan";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import sun from "animations/sun.json";
import moon from "animations/moon.json";

initFirebase();

function App() {
  const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
  const [darkmode, setDarkMode] = useState(systemDarkMode.matches);
  useEffect(() => {
    if (!systemDarkMode.addEventListener) {
      return;
    }
    systemDarkMode.addEventListener("change", (event) => {
      setDarkMode(event.matches);
    });
  }, [systemDarkMode, setDarkMode]);

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

  const likesCollection = useFirestore(
    household,
    (doc) => doc.ref.collection("likes"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as Like))
  );

  const likesBlob = useFirestoreDoc(
    household,
    (doc) => doc.ref.collection("blobs").doc("likes"),
    (snapshot) => Object.values(snapshot.data() || {}) as Like[]
  );

  const likes = [...(likesCollection || []), ...(likesBlob || [])];

  const trashCollection = useFirestore(
    household,
    (doc) => doc.ref.collection("trash"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as Trash))
  );

  const trashBlob = useFirestoreDoc(
    household,
    (doc) => doc.ref.collection("blobs").doc("trash"),
    (snapshot) => Object.values(snapshot.data() || {}) as Trash[]
  );

  const trash = [...(trashCollection || []), ...(trashBlob || [])];

  const pantryCollection = useFirestore(
    household,
    (doc) => doc.ref.collection("pantry"),
    (snapshot) => ({
      items: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
      ),
    })
  );

  const pantryBlob = useFirestoreDoc(
    household,
    (doc) => doc.ref.collection("blobs").doc("pantry"),
    (snapshot) => ({
      items: Object.values(
        (snapshot.data() || {}) as {
          [key: string]: { [key: string]: PantryItem };
        }
      )
        .map((item) => Object.values(item))
        .flat(1),
    })
  );

  const pantry =
    pantryCollection !== undefined && pantryBlob !== undefined
      ? { items: [...pantryCollection.items, ...pantryBlob.items] }
      : undefined;

  const mealPlan: MealPlan | undefined = useFirestore(
    household,
    (doc) => doc.ref.collection("mealplan").orderBy("created"),
    (snapshot) => ({
      recipes: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
      ),
    })
  );

  return (
    <AuthStateContext.Provider value={authState}>
      <LikesContext.Provider value={likes || []}>
        <TrashContext.Provider value={trash || []}>
          <PantryContext.Provider value={pantry}>
            <MealPlanContext.Provider value={mealPlan}>
              <Router>
                <Stack
                  css={{ minHeight: "100vh" }}
                  className={darkmode ? "Darkmode" : ""}
                  id="AppRoot"
                >
                  <ScrollToTop />
                  <NavigationBar></NavigationBar>
                  {currentUser === undefined ? (
                    <Spinner />
                  ) : !currentUser ? (
                    <LoggedOutTemplate />
                  ) : !household ? (
                    <GetStartedTemplate />
                  ) : (
                    <Planner />
                  )}
                  <AnimatedIconButton
                    onClick={() => setDarkMode(!darkmode)}
                    animation={darkmode ? sun : moon}
                    css={{ marginLeft: "auto", marginTop: "auto" }}
                  />
                </Stack>
              </Router>
            </MealPlanContext.Provider>
          </PantryContext.Provider>
        </TrashContext.Provider>
      </LikesContext.Provider>
    </AuthStateContext.Provider>
  );
}

export default App;
