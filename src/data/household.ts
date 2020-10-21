import React from "react";

export interface Household {
  id: string;
  members: string[];
  invitees: string[];
}

export const HouseholdContext = React.createContext<{
  doc?: Household | null;
  ref?: firebase.firestore.DocumentReference;
}>({ doc: undefined, ref: undefined });
