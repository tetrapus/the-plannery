import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import React, { useContext } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { Flex } from "../atoms/Flex";
import { IconButton } from "../atoms/IconButton";
import { TextInput } from "../atoms/TextInput";

export function InviteSection() {
  const { household } = useContext(AuthStateContext);

  const addUserRef = React.createRef<HTMLInputElement>();

  return (
    <>
      <h2>Invites</h2>
      {household?.invitees.map((email) => (
        <div key={email} css={{ marginBottom: 4 }}>
          {email}
        </div>
      ))}
      <Flex css={{ alignItems: "center" }}>
        <TextInput placeholder="Invite by email" ref={addUserRef}></TextInput>
        <IconButton
          icon={faUserPlus}
          onClick={() => {
            if (addUserRef.current) {
              household?.ref.update({
                invitees: firebase.firestore.FieldValue.arrayUnion(
                  addUserRef.current?.value
                ),
              });
              addUserRef.current.value = "";
            }
          }}
        />
      </Flex>
    </>
  );
}
