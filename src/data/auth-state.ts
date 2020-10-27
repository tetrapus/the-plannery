import firebase from "firebase";
import React, { useContext } from "react";
import { useFirestore } from "../init/firebase";

export interface Household {
  id: string;
  ref: firebase.firestore.DocumentReference;
  members: string[];
  invitees: string[];
}

interface AuthState {
  loading: boolean;
  currentUser?: any;
  household?: Household | null;
  insertMeta: { by?: string; created: firebase.firestore.FieldValue };
}

export const AuthStateContext = React.createContext<AuthState>({
  loading: true,
  insertMeta: { created: firebase.firestore.FieldValue.serverTimestamp() },
});

export function useHouseholdCollection<T>(
  collectionFn: (
    household: firebase.firestore.DocumentReference
  ) => firebase.firestore.Query<firebase.firestore.DocumentData>,
  transformerFn: (
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) => T
) {
  const { household } = useContext(AuthStateContext);
  return useFirestore(
    household,
    (household) => collectionFn(household.ref),
    transformerFn
  );
}
