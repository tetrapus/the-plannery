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

export default function NavigationBar() {
  const { currentUser } = useContext(AuthStateContext);

  if (!currentUser) {
    return null;
  }

  return (
    <Flex
      css={{
        backgroundColor: `white`,
        borderBottom: `1px solid #dedede`,
        height: 64,
        paddingLeft: 16,
        alignItems: "center",
      }}
    >
      <Flex css={{ flexGrow: 1, alignItems: "center" }}>
        <Link to="/">
          <img
            src="/logo.png"
            css={{ objectFit: `cover`, height: 64 }}
            alt="The Plannery Logo"
          />
        </Link>
        <Link to="/history">
          <IconButton icon={faHistory} />
        </Link>
        <Link to="/shopping-list">
          <IconButton icon={faShoppingBasket} />
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
