import firebase from "firebase";
import React from "react";
import { StyledFirebaseAuth } from "react-firebaseui";
import { Stack } from "../atoms/Stack";

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: "redirect",
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

export function LoggedOutTemplate() {
  return (
    <Stack css={{ marginTop: "50vh", transform: "translateY(-50%)" }}>
      <img
        src="logo-big.png"
        alt="The Plannery"
        height="150px"
        css={{ margin: "auto", paddingBottom: 40 }}
      ></img>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </Stack>
  );
}
