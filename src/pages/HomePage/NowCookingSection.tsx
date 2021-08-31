import { faStopCircle } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useHouseholdCollection } from "../../data/auth-state";
import { getRecipe, Recipe } from "../../data/recipes";
import { RecipeList } from "../../components/organisms/RecipeList";
import firebase from "firebase";

interface Session {
  ref: firebase.firestore.DocumentReference;
  slug: string;
  by: string;
  created: firebase.firestore.Timestamp;
}

interface Props {
  recipes?: Recipe[];
}

export function NowCookingSection({ recipes }: Props) {
  const sessions = useHouseholdCollection(
    (household) => household.collection("sessions"),
    (snapshot) =>
      snapshot.docs.map(
        (doc) => ({ ref: doc.ref, slug: doc.id, ...doc.data() } as Session)
      )
  );
  if (!sessions || !sessions.length) {
    return null;
  }
  return (
    <>
      <h1 css={{ marginLeft: 8 }}>Now Cooking</h1>
      <RecipeList
        recipes={sessions
          .map((session) => getRecipe(recipes, session.slug))
          .filter((x): x is Recipe => x !== undefined)}
        dismiss={{
          icon: faStopCircle,
          onClick: (recipe) => (e) => {
            sessions
              .find((session) => session.slug === recipe.slug)
              ?.ref.delete();
            e.preventDefault();
          },
        }}
      ></RecipeList>
    </>
  );
}
