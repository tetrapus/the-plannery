import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import React, { useContext } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { useFirestore } from "../../init/firebase";
import { Flex } from "../atoms/Flex";
import { IconButton } from "../atoms/IconButton";
import { Stack } from "../atoms/Stack";
import { TextInput } from "../atoms/TextInput";

interface User {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  ref: firebase.firestore.DocumentReference;
}

export function YourHomeSection() {
  const { household } = useContext(AuthStateContext);
  const users = useFirestore(
    household,
    (doc) => doc.ref.collection("users"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as User))
  );

  const addUserRef = React.createRef<HTMLInputElement>();

  return (
    <>
      <h2>Your Home</h2>
      <Stack>
        {users?.map((user) => (
          <Flex css={{ alignItems: "center", marginBottom: 4 }}>
            <img
              src={user.photoURL}
              height={32}
              width={32}
              css={{ borderRadius: 3 }}
              alt=""
            ></img>
            <span css={{ marginLeft: 8 }}>{user.displayName}</span>
          </Flex>
        ))}
      </Stack>
      {household?.invitees.map((email) => (
        <div key={email} css={{ marginBottom: 4 }}>
          {email}
        </div>
      ))}
      <Flex css={{ alignItems: "center" }}>
        <TextInput placeholder="Invite by email" ref={addUserRef}></TextInput>
        <IconButton
          icon={faUserPlus}
          css={{ fontSize: 24 }}
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
