import firebase from "firebase";
import React, { useContext, useState } from "react";
import {
  AuthStateContext,
  useHouseholdCollection,
} from "../../data/auth-state";
import { Flex } from "../../components/atoms/Flex";
import { Stack } from "../../components/atoms/Stack";
import { TextInput } from "../../components/atoms/TextInput";
import { UserCard } from "../../components/molecules/UserCard";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import invite from "animations/invite.json";

type User = firebase.User & { ref: firebase.firestore.DocumentReference };

export function YourHomeSection() {
  const { household } = useContext(AuthStateContext);
  const users = useHouseholdCollection(
    (household) => household.collection("users"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() } as User))
  );

  const [email, setEmail] = useState("");
  const isEmailValid = email.match(".+@.+");
  return (
    <Stack css={{ margin: "0 8px" }}>
      <Stack>
        {users?.map((user) => (
          <UserCard user={user} size={32} key={user.email} />
        ))}
      </Stack>
      {household?.invitees.map((email) => (
        <div key={email} css={{ marginBottom: 4 }}>
          {email}
        </div>
      ))}
      <Flex css={{ alignItems: "center" }}>
        <TextInput
          placeholder="Invite by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></TextInput>
        <AnimatedIconButton
          animation={invite}
          iconSize={48}
          active={!!email && !!isEmailValid}
          onClick={() => {
            if (!isEmailValid) return;
            household?.ref.update({
              invitees: firebase.firestore.FieldValue.arrayUnion(email),
            });
            setEmail("");
          }}
        />
      </Flex>
    </Stack>
  );
}
