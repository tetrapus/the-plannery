import firebase from "firebase";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Flex } from "../atoms/Flex";
import { AuthStateContext } from "../../data/auth-state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../molecules/UserCard";
import { Breakpoint } from "components/styles/Breakpoint";
import { Darkmode } from "../styles/Darkmode";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import paperbag from "animations/paper-bag.json";
import pasta from "animations/pasta.json";
import reverseclock from "animations/reverse-clock.json";
import { YourHomeSection } from "pages/HomePage/YourHomeSection";
import { Card } from "components/atoms/Card";
import { Grid } from "components/atoms/Grid";

export default function NavigationBar() {
  const { currentUser } = useContext(AuthStateContext);

  if (!currentUser) {
    return null;
  }

  return (
    <Grid
      css={{
        padding: 8,
        background: "rgba(245,245,245,0.6)",
        zIndex: 1,
        alignItems: "flex-start",
        gridTemplateColumns: "1fr 1fr 1fr",
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
      <Flex>
        <Link to="/shopping-list">
          <AnimatedIconButton animation={paperbag} />
        </Link>
        <Link to="/browse">
          <AnimatedIconButton animation={pasta} />
        </Link>
        <Link to="/history">
          <AnimatedIconButton animation={reverseclock} />
        </Link>
      </Flex>
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
      <Flex
        css={{
          position: "absolute",
          right: 8,
          top: 8,
          minWidth: 48,
        }}
      >
        {currentUser ? <UserMenu currentUser={currentUser} /> : null}
      </Flex>
    </Grid>
  );
}

function UserMenu({ currentUser }: { currentUser: firebase.User }) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  return (
    <Card
      css={{
        alignSelf: "baseline",
        marginLeft: "auto",
        width: 270,
        ...(collapsed
          ? {
              background: "transparent",
              boxShadow: "none",
              width: "auto",
              borderBottom: "1px solid transparent",
            }
          : {}),
        [Breakpoint.MOBILE]: collapsed
          ? {}
          : {
              margin: 0,
              width: "calc(100vw - 16px)",
              height: "calc(100vh - 16px)",
            },
      }}
    >
      <Flex
        css={{
          borderBottom: "1px solid #f0f0f0",
          padding: "4px",
          cursor: "pointer",
          alignItems: "center",
          [Darkmode]: { borderBottom: "1px solid #333" },
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {!collapsed ? <div css={{ marginLeft: 8 }}>Your Home</div> : null}
        <span css={{ marginLeft: "auto" }}>
          <UserAvatar user={currentUser} size={42} />
        </span>
      </Flex>
      {!collapsed ? (
        <>
          <YourHomeSection></YourHomeSection>
          <Flex
            onClick={() => firebase.auth().signOut()}
            css={{
              padding: "16px",
              cursor: "pointer",
              alignItems: "center",
              borderRadius: 8,
              ":hover": { background: "#f0f0f0" },
              color: "#333",
              [Darkmode]: {
                color: "#eee",
                ":hover": { background: "#333" },
              },
            }}
          >
            Log Out
            <FontAwesomeIcon icon={faArrowRight} css={{ marginLeft: "auto" }} />
          </Flex>
        </>
      ) : null}
    </Card>
  );
}
