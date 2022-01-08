import firebase from "firebase";
import React from "react";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Breakpoint } from "../styles/Breakpoint";
import { Darkmode } from "../styles/Darkmode";

interface Props {
  user: firebase.User;
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
      <Stack
        css={{ margin: size / 8, [Breakpoint.TABLET]: { display: "none" } }}
      >
        <div>{user?.displayName}</div>
        <div
          css={{
            fontSize: size / 3,
            color: "#666",
            [Darkmode]: { color: "#aaa" },
          }}
        >
          {user?.email}
        </div>
      </Stack>
    </Flex>
  );
}
