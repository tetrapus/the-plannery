export interface HistoryItem {
  slug: string;
  by: string;
  ref: firebase.firestore.DocumentReference;
}

export interface RecipeHistory {
  history: HistoryItem[];
}
