import React from "react";

export interface Trash {
  ref: firebase.firestore.DocumentReference;
  slug: string;
  by: string;
}

export const TrashContext = React.createContext<Trash[]>([]);
