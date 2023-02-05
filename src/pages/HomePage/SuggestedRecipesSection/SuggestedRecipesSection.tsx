import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../../../components/atoms/Stack";
import { RecipeList } from "../../../components/organisms/RecipeList";
import { LikesContext } from "../../../data/likes";
import {
  deletePantryItem,
  PantryContext,
  updatePantryItem,
} from "../../../data/pantry";
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
import {
  getIngredientsForMealPlan,
  MealPlanContext,
} from "../../../data/meal-plan";
import { Breakpoint } from "components/styles/Breakpoint";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import heart from "animations/heart.json";
import rules from "animations/rules.json";
import { IngredientAmount, isSameIngredient } from "data/ingredients";
import { Flex } from "components/atoms/Flex";
import IngredientCard from "components/molecules/IngredientCard";
import { IconButton } from "components/atoms/IconButton";

interface Props {
  recipes: Recipe[];
}

export default function SuggestedRecipesSection({ recipes }: Props) {
  const showFilters$ = useStateObject<boolean>(true);
  const showLiked$ = useStateObject<boolean>(false);
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

  const recipeList = recipes?.filter(
    ({ slug }) => !showLiked$.value || likes.find((like) => like.slug === slug)
  );

  const requiredIngredients = mealPlan
    ? getIngredientsForMealPlan(recipeList, mealPlan)
    : [];
  const pantryItems = (pantry?.items || []).map((pantryItem) => {
    const requiredIngredient = requiredIngredients.find((ingredient) =>
      isSameIngredient(ingredient, pantryItem.ingredient)
    );
    if (!requiredIngredient || !pantryItem.ingredient.qty) {
      return pantryItem;
    }
    return {
      ...pantryItem,
      ingredient: {
        ...pantryItem.ingredient,
        qty: requiredIngredient.qty
          ? Math.max(0, pantryItem.ingredient.qty - requiredIngredient.qty)
          : 0,
      },
    };
  });

  const unpinnedPantryItems = pantryItems.filter(
    (pantryItem) => pantryItem.ingredient.qty
  );

  const [unselectedLeftovers, setUnselectedLeftovers] = useState<{
    [key: string]: true;
  }>({});

  const mergedPreferences: Preference[] = [
    ...unpinnedPantryItems
      .filter((item) => !unselectedLeftovers[item.ingredient.type.id])
      .map((item) => ({
        type: "ingredient" as "ingredient",
        id: item.ingredient.type.id,
        preference: "prefer" as "prefer",
      })),
    ...(preferences || []),
  ];

  const suggestedRecipes = getSuggestedRecipes(
    recipeList,
    mergedPreferences,
    {
      likes,
      trash,
      pantry: pantryItems,
      history: history?.history || [],
    },
    limit
  )?.filter((recipe) => !mealPlan?.recipes.find((r) => r.slug === recipe.slug));

  console.log(suggestedRecipes);

  if (!mealPlan) {
    return null;
  }

  return (
    <Stack>
      <h1 css={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
        Suggested for you
        <AnimatedIconButton
          animation={heart}
          iconSize={40}
          css={{
            marginLeft: "auto",
            opacity: showLiked$.value ? 1 : 0.5,
            ":hover": { opacity: 1 },
          }}
          active={showLiked$.value}
          onClick={() => {
            showLiked$.set((state) => !state);
          }}
        />
        <AnimatedIconButton
          animation={rules}
          css={{
            opacity: showFilters$.value ? 1 : 0.5,
            ":hover": { opacity: 1 },
          }}
          active={showFilters$.value}
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
      {pantryItems.length > 0 ? (
        <Stack css={{ marginBottom: 16 }}>
          <h3 css={{ marginLeft: 8 }}>Leftover ingredients</h3>
          <Flex
            css={{
              flexWrap: "wrap",
              marginLeft: 24,
              [Breakpoint.MOBILE]: {
                marginLeft: 8,
                paddingLeft: 0,
              },
            }}
          >
            {unpinnedPantryItems.map((pantryItem) => (
              <IngredientCard
                ingredient={pantryItem.ingredient}
                status={IngredientAmount({
                  ingredient: pantryItem.ingredient,
                })}
                onClick={(e) => {
                  const id = pantryItem.ingredient.type.id;
                  if (unselectedLeftovers[id]) {
                    delete unselectedLeftovers[id];
                    setUnselectedLeftovers(unselectedLeftovers);
                  } else {
                    setUnselectedLeftovers({
                      ...unselectedLeftovers,
                      [id]: true,
                    });
                  }
                  e.preventDefault();
                  e.stopPropagation();
                }}
                done={!!unselectedLeftovers[pantryItem.ingredient.type.id]}
                action={
                  <IconButton
                    icon={faTrashAlt}
                    css={{
                      fontSize: 16,
                      marginLeft: "auto",
                      paddingLeft: 4,
                      ".IngredientCard:not(:hover) &": { visibility: "hidden" },
                    }}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (household) {
                        const originalItem = pantry?.items.find((item) =>
                          isSameIngredient(
                            item.ingredient,
                            pantryItem.ingredient
                          )
                        );
                        if (
                          originalItem?.ingredient.qty &&
                          pantryItem.ingredient.qty
                        ) {
                          if (
                            originalItem.ingredient.qty >
                            pantryItem.ingredient.qty
                          ) {
                            await updatePantryItem(
                              household,
                              {
                                ...pantryItem,
                                ingredient: {
                                  ...pantryItem.ingredient,
                                  qty:
                                    originalItem.ingredient.qty -
                                    pantryItem.ingredient.qty,
                                },
                              },
                              insertMeta
                            );
                          } else {
                            await deletePantryItem(household, pantryItem);
                          }
                        }
                      }
                    }}
                  ></IconButton>
                }
              ></IngredientCard>
            ))}
          </Flex>
        </Stack>
      ) : null}
      <RecipeList
        recipes={suggestedRecipes || []}
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
