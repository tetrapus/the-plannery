import firebase from "firebase";
import React from "react";

export interface Like {
  ref?: firebase.firestore.DocumentReference;
  slug: string;
  by: string;
}

export const LikesContext = React.createContext<Like[]>([]);
