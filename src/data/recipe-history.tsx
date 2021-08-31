import firebase from "firebase";

export interface HistoryItem {
  slug: string;
  by: string;
  ref: firebase.firestore.DocumentReference;
  created: firebase.firestore.Timestamp;
}

export interface RecipeHistory {
  history: HistoryItem[];
}
