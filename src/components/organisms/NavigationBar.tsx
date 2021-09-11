import firebase from "firebase";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Flex } from "../atoms/Flex";
import { AuthStateContext } from "../../data/auth-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { UserCard } from "../molecules/UserCard";
import { Breakpoint } from "components/styles/Breakpoint";
import { Darkmode } from "../styles/Darkmode";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import paperbag from "animations/paper-bag.json";
import pasta from "animations/pasta.json";
import reverseclock from "animations/reverse-clock.json";

export default function NavigationBar() {
  const { currentUser } = useContext(AuthStateContext);

  if (!currentUser) {
    return null;
  }

  return (
    <Flex
      css={{
        height: 64,
        paddingLeft: 16,
        alignItems: "center",
        background: "rgba(245,245,245,0.6)",
        zIndex: 1,
        [Darkmode]: {
          background: "rgba(34,34,34,0.6)",
        },
        [Breakpoint.MOBILE]: {
          background: "rgba(255,255,255,0.6)",
          [Darkmode]: {
            background: "rgba(10,10,10,0.6)",
          },
        },
      }}
    >
      <Flex css={{ flexGrow: 1, alignItems: "center" }}>
        <Link to="/shopping-list">
          <AnimatedIconButton animation={paperbag} />
        </Link>
        <Link to="/browse">
          <AnimatedIconButton animation={pasta} />
        </Link>
        <Link to="/history">
          <AnimatedIconButton animation={reverseclock} />
        </Link>
        <Link
          to="/"
          css={{
            margin: "auto",
            display: "flex",
            alignItems: "center",
            [Breakpoint.MOBILE]: { order: -1, margin: 0, marginRight: 4 },
          }}
        >
          <img
            src="/logo192.png"
            css={{
              objectFit: `cover`,
              height: 50,
              marginRight: 4,
              [Darkmode]: {
                background: "white",
                borderRadius: 24,
              },
            }}
            alt="The Plannery Logo"
          />
          <img
            src="/wordmark.png"
            css={{
              objectFit: `cover`,
              height: 24,
              [Breakpoint.MOBILE]: { display: "none" },
              [Darkmode]: {
                filter: "invert(1)",
              },
            }}
            alt="The Plannery Wordmark"
          />
        </Link>
      </Flex>
      {currentUser ? (
        <Flex css={{ alignItems: "center" }}>
          <UserCard user={currentUser} size={42} />
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
