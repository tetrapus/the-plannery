import React from "react";

export interface Household {
  id: string;
  members: string[];
}

export const HouseholdContext = React.createContext<{
  doc?: Household | {};
  ref?: firebase.firestore.DocumentReference;
}>({ doc: undefined, ref: undefined });
