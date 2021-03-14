import { faCogs, faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect } from "react";
import { IconButton } from "../../../components/atoms/IconButton";
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
import { MealPlanItem } from "../../../data/meal-plan";
import RecipeSearchSettingsSection from "./RecipeSearchSettingsSection";
import { RecipeHistory, HistoryItem } from "data/recipe-history";
import { db } from "init/firebase";

interface Props {
  recipes: Recipe[];
}

export default function SuggestedRecipesSection({ recipes }: Props) {
  const showFilters$ = useStateObject<boolean>(true);
  /*const [_, setPreferences] = useState<Preference[]>([
    { id: "Liked recipes", type: "liked", preference: "prefer" },
    { id: "Ready to cook", type: "ready-to-cook", preference: "prefer" },
    { id: "Recently cooked", type: "recent", preference: "reduce" },
    { id: "Disliked recipes", type: "trash", preference: "exclude" },
  ]); */

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
    (doc) => doc.collection("history"),
    (snapshot) => ({
      history: snapshot.docs.map((doc) => ({
        ...(doc.data() as HistoryItem),
        ref: doc.ref,
      })),
    })
  );

  const mealPlan = useHouseholdCollection(
    (doc) => doc.collection("mealplan"),
    (snapshot) => ({
      recipes: snapshot.docs.map(
        (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
      ),
    })
  );
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

  const suggestedRecipes = getSuggestedRecipes(recipes, preferences, {
    likes,
    trash,
    pantry: pantry?.items || [],
    history: history?.history || [],
  })?.filter(
    ({ recipe }) => !mealPlan?.recipes.find((r) => r.slug === recipe.slug)
  );

  if (!mealPlan) {
    return null;
  }

  return (
    <Stack>
      <h1 css={{ marginLeft: 8 }}>
        Suggested for you
        <IconButton
          icon={faCogs}
          onClick={() => showFilters$.set((state) => !state)}
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
        actions={[
          {
            icon: faPlus,
            onClick: (recipe) => (e) => {
              household?.ref
                .collection("mealplan")
                .add({ slug: recipe.slug, ...insertMeta });
              e.preventDefault();
            },
          },
        ]}
      />
    </Stack>
  );
}
