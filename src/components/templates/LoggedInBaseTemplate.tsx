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
  household: Household | undefined | null;
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
          ? ({
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
            } as Household)
          : null;
        setState({ household });
      });
  }, [currentUser]);

  return (
    <HouseholdContext.Provider
      value={{
        doc: household,
        ref: household?.id
          ? db.collection("household").doc(household.id)
          : undefined,
      }}
    >
      {loading ? (
        <Spinner />
      ) : !currentUser ? (
        <LoggedOutTemplate />
      ) : !household ? (
        <GetStartedTemplate />
      ) : (
        <div>{children}</div>
      )}
    </HouseholdContext.Provider>
  );
}
