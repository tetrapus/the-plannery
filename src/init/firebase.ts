import firebase from "firebase";
import { useCallback, useEffect, useState } from "react";

let initialised = false;

export function initFirebase() {
  if (initialised) {
    return;
  }
  const firebaseConfig = {
    apiKey: "AIzaSyAwgocAmSn4Gw-98OQtLfcR2jaU5P4qfhM",
    authDomain: "the-plannery.firebaseapp.com",
    databaseURL: "https://the-plannery.firebaseio.com",
    projectId: "the-plannery",
    storageBucket: "the-plannery.appspot.com",
    messagingSenderId: "54197750751",
    appId: "1:54197750751:web:3f403a2732c88d3757126a",
    measurementId: "G-JWFHLSV59G",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  initialised = true;
}

initFirebase();

export const db = firebase.firestore();

window.firebase = firebase;

export function useFirestore<S, T>(
  rootDoc: S | undefined | null,
  collectionFn: (
    rootDoc: S
  ) => firebase.firestore.Query<firebase.firestore.DocumentData> | undefined,
  transformerFn: (
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) => T
) {
  const [state, setState] = useState<T>();
  const collection = useCallback(collectionFn, []);
  const transformer = useCallback(transformerFn, []);
  useEffect(() => {
    if (!rootDoc) {
      return;
    }
    const query = collection(rootDoc);
    if (!query) {
      return;
    }
    return query.onSnapshot((snapshot) => setState(transformer(snapshot)));
  }, [rootDoc, collection, transformer]);
  return state;
}
