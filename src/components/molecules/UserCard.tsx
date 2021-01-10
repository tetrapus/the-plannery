import firebase from "firebase";
import React from "react";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";

export interface User {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  ref: firebase.firestore.DocumentReference;
}

interface Props {
  user: User;
  size: number;
}

export function UserCard({ user, size }: Props) {
  return (
    <Flex css={{ alignItems: "center" }}>
      <img
        src={user?.photoURL || "#"}
        css={{
          width: size,
          height: size,
          borderRadius: 3,
          marginRight: size / 8,
        }}
        alt="Profile"
      />
      <Stack css={{ margin: size / 8 }}>
        <div>{user?.displayName}</div>
        <div css={{ fontSize: size / 3, color: "#666" }}>{user?.email}</div>
      </Stack>
    </Flex>
  );
}
