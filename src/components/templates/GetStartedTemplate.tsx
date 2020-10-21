import React, { useContext } from "react";
import { Stack } from "../atoms/Stack";
import { Button } from "../atoms/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { AuthStateContext } from "../../data/auth-state";
import { db } from "../../init/firebase";
import { HouseholdContext } from "../../data/household";
import { Spinner } from "../atoms/Spinner";

export function GetStartedTemplate() {
  const { currentUser } = useContext(AuthStateContext);
  const { doc } = useContext(HouseholdContext);
  if (doc === undefined) {
    return <Spinner />;
  }
  return (
    <Stack css={{ marginLeft: "auto", marginRight: "auto", marginTop: 64 }}>
      <h1>Welcome to The Plannery</h1>
      <Button
        css={{ marginBottom: 8 }}
        onClick={() =>
          db.collection("household").add({ members: [currentUser.uid] })
        }
      >
        <FontAwesomeIcon
          icon={faUtensils}
          css={{ opacity: 0.4, marginRight: 12 }}
        />
        Create a new plan
      </Button>
      <Button>
        <FontAwesomeIcon
          icon={faUserPlus}
          css={{ opacity: 0.4, marginRight: 12 }}
        />
        Join a household
      </Button>
    </Stack>
  );
}
