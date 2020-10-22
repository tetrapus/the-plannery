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
}

export const AuthStateContext = React.createContext<AuthState>({
  loading: true,
});
