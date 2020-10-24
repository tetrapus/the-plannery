import firebase from "firebase";
import React from "react";

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
