import firebase from "firebase";
import React, { useState } from "react";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Breakpoint } from "../styles/Breakpoint";
import { Darkmode } from "../styles/Darkmode";

interface Props {
  user: firebase.User;
  size: number;
}

export function UserCard({ user, size }: Props) {
  const [errorState, setErrorState] = useState<boolean>(false);
  return (
    <Flex css={{ alignItems: "center" }}>
      {!errorState ? (
        <img
          src={user?.photoURL || "#"}
          css={{
            width: size,
            height: size,
            borderRadius: 8,
            marginRight: size / 8,
          }}
          alt=""
          onError={(e) => setErrorState(true)}
        />
      ) : (
        <div css={{ width: size, height: size, marginRight: size / 8 }}></div>
      )}
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
