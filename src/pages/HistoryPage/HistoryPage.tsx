import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "../../components/atoms/Spinner";
import { HistoryTemplate } from "./HistoryTemplate";
import { HistoryItem } from "../../data/recipe-history";
import { getRecipes, Recipe, RecipesCollection } from "../../data/recipes";
import { useSubscription } from "../../util/use-subscription";
import { AuthStateContext } from "data/auth-state";
import firebase from "firebase";
import ReactVisibilitySensor from "react-visibility-sensor";

const parseHistory = (
  snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
) => {
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as HistoryItem),
    ref: doc.ref,
  }));
};

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>();
  const { household } = useContext(AuthStateContext);

  useEffect(() => {
    household?.ref
      .collection("history")
      .orderBy("created", "desc")
      .limit(10)
      .get()
      .then((snapshot) => {
        const history = parseHistory(snapshot);
        setHistory((previousHistory) => [
          ...(previousHistory || []),
          ...history,
        ]);
      });
  }, [household]);

  const recipes = useSubscription<Recipe[]>((setRecipes) =>
    RecipesCollection.subscribe((recipes) => setRecipes(getRecipes(recipes)))
  );
  if (!history || recipes === undefined) return <Spinner />;
  return (
    <>
      <HistoryTemplate history={history && { history }} recipes={recipes} />
      <ReactVisibilitySensor
        onChange={async (isVisible) => {
          if (!isVisible) {
            return;
          }
          const snapshot = await household?.ref
            .collection("history")
            .orderBy("created", "desc")
            .startAfter(history[history.length - 1].created)
            .limit(10)
            .get();
          if (snapshot) {
            const history = parseHistory(snapshot);
            setHistory((previousHistory) => [
              ...(previousHistory || []),
              ...history,
            ]);
          }
        }}
      >
        <Spinner />
      </ReactVisibilitySensor>
    </>
  );
}
