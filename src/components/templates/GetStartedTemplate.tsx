import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../atoms/Stack";
import { TextButton } from "../atoms/TextButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { AuthStateContext } from "../../data/auth-state";
import { db } from "../../init/firebase";
import { Spinner } from "../atoms/Spinner";
import firebase from "firebase";

export function GetStartedTemplate() {
  const { currentUser, household } = useContext(AuthStateContext);
  const [{ invitations }, setState] = useState({
    invitations: [] as firebase.firestore.QueryDocumentSnapshot[],
  });
  useEffect(() => {
    if (!currentUser) {
      return;
    }
    db.collection("household")
      .where("invitees", "array-contains", currentUser?.email)
      .get()
      .then((response) => setState({ invitations: response.docs }));
  }, [currentUser]);

  if (household === undefined) {
    return <Spinner />;
  }

  return (
    <Stack css={{ marginLeft: "auto", marginRight: "auto", marginTop: 64 }}>
      <h1>Welcome to The Plannery</h1>
      <TextButton
        css={{ marginBottom: 8 }}
        onClick={() =>
          db.collection("household").add({
            members: [currentUser.uid],
            ownerName: currentUser.displayName,
            invitees: [],
          })
        }
      >
        <FontAwesomeIcon
          icon={faUtensils}
          css={{ opacity: 0.4, marginRight: 12 }}
        />
        Create a new plan
      </TextButton>
      {invitations.map((household) => (
        <TextButton
          key={household.id}
          onClick={() =>
            household.ref.update({
              members: firebase.firestore.FieldValue.arrayUnion(
                currentUser.uid
              ),
              invitees: firebase.firestore.FieldValue.arrayRemove(
                currentUser.email
              ),
            })
          }
        >
          <FontAwesomeIcon
            icon={faUserPlus}
            css={{ opacity: 0.4, marginRight: 12 }}
          />
          Join {household.get("ownerName")}'s home
        </TextButton>
      ))}
    </Stack>
  );
}
