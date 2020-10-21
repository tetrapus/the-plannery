import firebase from "firebase";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { AuthStateContext } from "../../data/auth-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function NavigationBar() {
  const { currentUser } = useContext(AuthStateContext);

  if (!currentUser) {
    return null;
  }

  return (
    <Flex
      css={{
        backgroundColor: `white`,
        borderBottom: `1px solid grey`,
        height: 64,
        paddingLeft: 16,
        alignItems: "center",
      }}
    >
      <Link to="/" css={{ flexGrow: 1 }}>
        <img
          src="/logo.png"
          css={{ objectFit: `cover`, height: 64 }}
          alt="The Plannery Logo"
        />
      </Link>
      {currentUser ? (
        <Flex css={{ alignItems: "center" }}>
          <img
            src={currentUser?.photoURL || "#"}
            css={{ width: 48, height: 48, borderRadius: 3 }}
            alt="Profile"
          />
          <Stack css={{ margin: 8 }}>
            <div>{currentUser?.displayName}</div>
            <div css={{ fontSize: 12, color: "#666" }}>
              {currentUser?.email}
            </div>
          </Stack>
          <FontAwesomeIcon
            icon={faTimes}
            css={{ margin: 8 }}
            onClick={() => firebase.auth().signOut()}
          />
        </Flex>
      ) : null}
    </Flex>
  );
}
