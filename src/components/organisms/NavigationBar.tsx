import firebase from "firebase";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Flex } from "../atoms/Flex";
import { AuthStateContext } from "../../data/auth-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faShoppingBasket,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../atoms/IconButton";
import { UserCard } from "../molecules/UserCard";
import { Breakpoint } from "components/styles/Breakpoint";
import { Darkmode } from "../styles/Darkmode";

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
        [Darkmode]: {
          background: "rgba(34,34,34,0.6)",
        },
      }}
    >
      <Flex css={{ flexGrow: 1, alignItems: "center" }}>
        <Link to="/history">
          <IconButton icon={faHistory} />
        </Link>
        <Link to="/shopping-list">
          <IconButton icon={faShoppingBasket} />
        </Link>
        <Link
          to="/"
          css={{
            margin: "auto",
            display: "flex",
            alignItems: "center",
            [Breakpoint.MOBILE]: { order: -1, margin: 0 },
          }}
        >
          <img
            src="/logo192.png"
            css={{
              objectFit: `cover`,
              height: 60,
              marginRight: 4,
              [Darkmode]: {
                background: "white",
                borderRadius: 31,
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
