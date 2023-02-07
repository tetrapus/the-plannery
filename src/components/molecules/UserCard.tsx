import firebase from "firebase";
import React, { useState } from "react";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Darkmode } from "../styles/Darkmode";

interface Props {
  user: firebase.User;
  size: number;
}

export function UserCard({ user, size }: Props) {
  return (
    <Flex css={{ alignItems: "center" }}>
      <UserAvatar user={user} size={size} />
      <Stack css={{ margin: size / 8, marginLeft: size / 4 }}>
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

export function UserAvatar({
  user,
  size,
}: {
  user: firebase.User;
  size: number;
}) {
  const [errorState, setErrorState] = useState<boolean>(false);
  return !errorState ? (
    <img
      src={user?.photoURL || "#"}
      css={{
        width: size,
        height: size,
        borderRadius: 8,
      }}
      alt=""
      onError={(e) => setErrorState(true)}
    />
  ) : (
    <div css={{ width: size, height: size }}></div>
  );
}
