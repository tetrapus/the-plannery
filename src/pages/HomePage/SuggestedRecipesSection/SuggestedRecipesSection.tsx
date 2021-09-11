import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../../../components/atoms/Stack";
import { RecipeList } from "../../../components/organisms/RecipeList";
import { LikesContext } from "../../../data/likes";
import { PantryContext } from "../../../data/pantry";
import { getSuggestedRecipes, Preference, Recipe } from "../../../data/recipes";
import { TrashContext } from "../../../data/trash";
import { useStateObject } from "../../../util/use-state-object";
import {
  AuthStateContext,
  useHouseholdCollection,
} from "../../../data/auth-state";
import RecipeSearchSettingsSection from "./RecipeSearchSettingsSection";
import { RecipeHistory, HistoryItem } from "data/recipe-history";
import { db } from "init/firebase";
import { TextButton } from "components/atoms/TextButton";
import { MealPlanContext } from "../../../data/meal-plan";
import { Breakpoint } from "components/styles/Breakpoint";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import rules from "animations/rules.json";

interface Props {
  recipes: Recipe[];
}

export default function SuggestedRecipesSection({ recipes }: Props) {
  const showFilters$ = useStateObject<boolean>(true);
  const preferences = useHouseholdCollection(
    (doc) => doc.collection("searchPreferences"),
    (snapshot) =>
      snapshot.docs.map((doc) => ({
        ...(doc.data() as Preference),
        id: doc.id,
        ref: doc.ref,
      }))
  );

  const likes = useContext(LikesContext);
  const trash = useContext(TrashContext);
  const pantry = useContext(PantryContext);

  const history = useHouseholdCollection<RecipeHistory>(
    (doc) =>
      doc
        .collection("history")
        .where("created", ">", new Date(Date.now() - 1000 * 60 * 60 * 24 * 31)),
    (snapshot) => ({
      history: snapshot.docs.map((doc) => ({
        ...(doc.data() as HistoryItem),
        ref: doc.ref,
      })),
    })
  );

  const mealPlan = useContext(MealPlanContext);
  const { household, insertMeta } = useContext(AuthStateContext);

  useEffect(() => {
    if (household && !household.searchPreferencesSet) {
      const batch = db.batch();
      const defaults = [
        {
          id: "Liked recipes",
          type: "liked",
          preference: "prefer",
          pinned: true,
        },
        {
          id: "Ready to cook",
          type: "ready-to-cook",
          preference: "prefer",
          pinned: true,
        },
        {
          id: "Recently cooked",
          type: "recent",
          preference: "reduce",
          pinned: true,
        },
        {
          id: "Disliked recipes",
          type: "trash",
          preference: "exclude",
          pinned: true,
        },
      ];
      defaults.forEach((preference) => {
        batch.set(
          household.ref.collection("searchPreferences").doc(preference.id),
          { ...preference, ...insertMeta }
        );
      });
      batch.update(household.ref, { searchPreferencesSet: true });
      batch.commit();
    }
  }, [household, insertMeta]);

  const [limit, setLimit] = useState<number>(12);

  const suggestedRecipes = getSuggestedRecipes(
    recipes,
    preferences,
    {
      likes,
      trash,
      pantry: pantry?.items || [],
      history: history?.history || [],
    },
    limit
  )?.filter(
    ({ recipe }) => !mealPlan?.recipes.find((r) => r.slug === recipe.slug)
  );

  if (!mealPlan) {
    return null;
  }

  return (
    <Stack>
      <h1 css={{ marginLeft: 8, display: "flex" }}>
        Suggested for you
        <AnimatedIconButton
          animation={rules}
          css={{ marginLeft: "auto" }}
          active={!showFilters$.value}
          onClick={() => {
            showFilters$.set((state) => !state);
          }}
        />
      </h1>
      {showFilters$.value && preferences !== undefined ? (
        <>
          <RecipeSearchSettingsSection
            recipes={recipes}
            preferences={preferences}
          />
        </>
      ) : null}
      <RecipeList
        recipes={(suggestedRecipes || []).map((r) => r.recipe)}
        select={{
          icon: faPlus,
          onClick: (recipe) => (e) => {
            household?.ref.collection("mealplan").add({
              slug: recipe.slug,
              ...insertMeta,
              planId: household?.planId || null,
            });
            e.preventDefault();
          },
        }}
      />
      <TextButton
        onClick={() => setLimit(limit + 12)}
        css={{
          marginBottom: 128,
          [Breakpoint.TABLET]: {
            margin: 16,
          },
        }}
      >
        Load More
      </TextButton>
    </Stack>
  );
}
