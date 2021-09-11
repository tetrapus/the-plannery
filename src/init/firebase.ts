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

db.enablePersistence().catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    // ...
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
  }
});

db.disableNetwork();

export function useFirestoreDoc<S, T>(
  rootDoc: S | undefined | null,
  collectionFn: (
    rootDoc: S
  ) =>
    | firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
    | undefined,
  transformerFn: (
    snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  ) => T
): T | undefined {
  const [state, setState] = useState<T>();
  useEffect(() => {
    console.log("Snapshot updated:", state);
  }, [state]);
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

export function useFirestore<S, T>(
  rootDoc: S | undefined | null,
  collectionFn: (
    rootDoc: S
  ) => firebase.firestore.Query<firebase.firestore.DocumentData> | undefined,
  transformerFn: (
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) => T
): T | undefined {
  const [state, setState] = useState<T>();
  useEffect(() => {
    console.log("Snapshot updated:", state);
  }, [state]);
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
