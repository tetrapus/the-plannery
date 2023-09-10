import { Spinner } from "components/atoms/Spinner";
import { AuthStateContext } from "data/auth-state";
import { HistoryItem } from "data/recipe-history";
import { useRecipes } from "data/recipes";
import firebase from "firebase";
import React, { useContext, useEffect, useState } from "react";
import ReactVisibilitySensor from "react-visibility-sensor";
import { HistoryTemplate } from "./HistoryTemplate";

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

  const recipes = useRecipes();
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
