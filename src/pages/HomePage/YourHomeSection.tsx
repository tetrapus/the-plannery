import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import React, { useContext, useState } from "react";
import {
  AuthStateContext,
  useHouseholdCollection,
} from "../../data/auth-state";
import { Flex } from "../../components/atoms/Flex";
import { IconButton } from "../../components/atoms/IconButton";
import { Stack } from "../../components/atoms/Stack";
import { TextInput } from "../../components/atoms/TextInput";
import { User, UserCard } from "../../components/molecules/UserCard";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import invite from "animations/invite.json";

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
    <>
      <h2>Your Home</h2>
      <Stack>
        {users?.map((user) => (
          <UserCard user={user} size={32} />
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
    </>
  );
}
