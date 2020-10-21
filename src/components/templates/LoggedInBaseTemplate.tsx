import React, { useContext, useEffect, useState } from "react";
import { AuthStateContext } from "../../data/auth-state";
import { Spinner } from "../atoms/Spinner";
import { GetStartedTemplate } from "./GetStartedTemplate";
import { LoggedOutTemplate } from "./LoggedOutTemplate";
import { Household, HouseholdContext } from "../../data/household";
import { db } from "../../init/firebase";

interface Props {
  children: React.ReactElement;
}

interface State {
  household: Household | undefined | {};
}

export function LoggedInBaseTemplate({ children }: Props) {
  const [{ household }, setState] = useState<State>({
    household: undefined,
  });
  const { currentUser, loading } = useContext(AuthStateContext);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    return db
      .collection("household")
      .where("members", "array-contains", currentUser?.uid)
      .onSnapshot((querySnapshot) => {
        const household = querySnapshot.docs.length
          ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
          : {};
        setState({ household });
      });
  }, [currentUser?.uid]);

  return (
    <HouseholdContext.Provider
      value={{
        doc: household,
        ref:
          household &&
          db.collection("household").doc((household as Household).id),
      }}
    >
      {loading ? (
        <Spinner />
      ) : !household ? (
        <GetStartedTemplate />
      ) : currentUser ? (
        <div>{children}</div>
      ) : (
        <LoggedOutTemplate />
      )}
    </HouseholdContext.Provider>
  );
}
