import firebase from "firebase";
import React from "react";
import { StyledFirebaseAuth } from "react-firebaseui";

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: "popup",
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

export function LoggedOutTemplate() {
  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}
