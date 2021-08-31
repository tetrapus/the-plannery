import firebase from "firebase";
export interface Session {
  by: string;
  ref: firebase.firestore.DocumentReference;
  steps: {
    [step: string]: {
      state: "done" | "claimed";
      by: string;
    };
  };
}
