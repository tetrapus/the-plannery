import firebase from "firebase";
import React from "react";
import { StyledFirebaseAuth } from "react-firebaseui";
import { Stack } from "../atoms/Stack";

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: iOS() ? "popup" : "redirect",
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
