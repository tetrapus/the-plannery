import React, { useContext, useEffect, useState } from "react";
import { Stack } from "../atoms/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faPlus,
  faTimes,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import {
  getIngredientsForMealPlan,
  MealPlan,
  MealPlanItem,
} from "../../data/meal-plan";
import {
  getRecipe,
  getRecipes,
  getSuggestedRecipes,
  Recipe,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { Pantry, PantryItem } from "../../data/pantry";
import { Spinner } from "../atoms/Spinner";
import firebase from "firebase";
import { Like, LikesContext } from "../../data/likes";
import { RecipeList } from "../organisms/RecipeList";
import { Breakpoint } from "../styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";
import { TextInput } from "../atoms/TextInput";
import Select, { OptionsType, OptionTypeBase } from "react-select";
import { ToggleButton } from "../atoms/ToggleButton";

interface State {
  mealPlan: MealPlan;
  pantry: Pantry;
  recipes: any[];
  likes: Like[];
  ingredientFilter: string[];
  ingredientBoosts: string[];
  usePantry: boolean;
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    pantry: { items: [] },
    recipes: RecipesCollection.initialState,
    likes: [],
    ingredientFilter: [],
    ingredientBoosts: [],
    usePantry: true,
  };
  const [
    {
      mealPlan,
      pantry,
      recipes,
      likes,
      ingredientFilter,
      usePantry,
      ingredientBoosts,
    },
    setState,
  ] = useState<State>(initialState);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { household, currentUser } = useContext(AuthStateContext);
  useEffect(() => {
    const hooks: (() => void)[] = [];
    if (household?.ref) {
      hooks.push(
        household?.ref.collection("mealplan").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            mealPlan: {
              recipes: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as MealPlanItem)
              ),
            },
          }))
        )
      );
      hooks.push(
        household?.ref.collection("pantry").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            pantry: {
              items: snapshot.docs.map(
                (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
              ),
            },
          }))
        )
      );
      hooks.push(
        household?.ref.collection("likes").onSnapshot((snapshot) =>
          setState((state) => ({
            ...state,
            likes: snapshot.docs.map(
              (doc) => ({ ref: doc.ref, ...doc.data() } as Like)
            ),
          }))
        )
      );
    }
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
    return () => hooks.forEach((hook) => hook());
  }, [household]);

  const addUser = React.createRef<HTMLInputElement>();

  return (
    <LikesContext.Provider value={likes}>
      <Flex>
        {recipes.length ? (
          <Stack
            css={{
              maxWidth: 800,
              marginLeft: "auto",
              placeItems: "flex-start",
            }}
          >
            {mealPlan.recipes.length ? (
              <>
                <h1>Your meal plan</h1>
                <RecipeList
                  recipes={mealPlan.recipes
                    .map((mealPlanItem) => getRecipe(mealPlanItem.slug))
                    .filter((x): x is Recipe => x !== undefined)}
                  actions={[
                    {
                      icon: faTimes,
                      onClick: (recipe) => () =>
                        mealPlan.recipes
                          .find(
                            (mealPlanItem) => mealPlanItem.slug === recipe.slug
                          )
                          ?.ref.delete(),
                    },
                  ]}
                ></RecipeList>
                <h2>Shopping list</h2>
                <IngredientList
                  ingredients={getIngredientsForMealPlan(mealPlan)}
                  pantry={pantry}
                />
              </>
            ) : null}
            <div>
              <h1>
                Suggested for you
                <FontAwesomeIcon
                  icon={faCogs}
                  css={{ color: "grey", fontSize: 24, marginLeft: 8 }}
                  onClick={() => setShowFilters((state) => !state)}
                />
              </h1>
              {showFilters ? (
                <div css={{ position: "relative" }}>
                  <ToggleButton
                    css={{ marginBottom: 8 }}
                    value={usePantry}
                    onChange={(value) =>
                      setState((state) => ({ ...state, usePantry: value }))
                    }
                  >
                    Use up pantry items
                  </ToggleButton>
                  <Select
                    isMulti
                    placeholder="Suggest recipes that use..."
                    css={{ marginBottom: 16, maxWidth: 600 }}
                    options={Object.values(
                      Object.fromEntries(
                        getRecipes()
                          .map((recipe) => recipe.ingredients)
                          .flat()
                          .map((ingredient) => [ingredient.type.id, ingredient])
                      )
                    ).map((ingredient) => ({
                      value: ingredient.type.id,
                      label: (
                        <Flex css={{ alignItems: "center" }}>
                          <img
                            src={ingredient.type.imageUrl}
                            css={{ height: 16, marginRight: 8 }}
                            alt=""
                          />
                          {ingredient.type.name}
                        </Flex>
                      ),
                    }))}
                    onChange={(options) =>
                      setState((state) => ({
                        ...state,
                        ingredientBoosts: ((options || []) as OptionsType<
                          OptionTypeBase
                        >).map((option) => option.value),
                      }))
                    }
                  ></Select>
                </div>
              ) : null}
              <RecipeList
                recipes={getSuggestedRecipes(
                  {
                    likes,
                    ingredients: [
                      ...(usePantry
                        ? pantry.items
                            .filter(
                              (item) =>
                                item.ingredient.unit || item.ingredient.qty
                            )
                            .map((item) => item.ingredient.type.id)
                        : []),
                      ...ingredientBoosts,
                    ],
                  },
                  { mealPlan, ingredients: ingredientFilter }
                )}
                actions={[
                  {
                    icon: faPlus,
                    onClick: (recipe) => () =>
                      household?.ref
                        .collection("mealplan")
                        .add({ slug: recipe.slug, by: currentUser.uid }),
                  },
                ]}
              ></RecipeList>
            </div>
          </Stack>
        ) : (
          <Stack css={{ width: 800, marginLeft: "auto", alignItems: "center" }}>
            <Spinner />
            Downloading recipe database...
          </Stack>
        )}
        <Stack
          css={{
            width: "calc(50vw - 400px)",
            [Breakpoint.TABLET]: { display: "none" },
          }}
        >
          <h2>Invites</h2>
          {household?.invitees.map((email) => (
            <div key={email} css={{ marginBottom: 4 }}>
              {email}
            </div>
          ))}
          <Flex>
            <TextInput placeholder="Invite by email" ref={addUser}></TextInput>
            <FontAwesomeIcon
              icon={faUserPlus}
              css={{ marginLeft: 8 }}
              onClick={() => {
                if (addUser.current) {
                  household?.ref.update({
                    invitees: firebase.firestore.FieldValue.arrayUnion(
                      addUser.current?.value
                    ),
                  });
                  addUser.current.value = "";
                }
              }}
            />
          </Flex>
          <h2>Pantry</h2>
          <IngredientList
            ingredients={pantry.items.map((item) => item.ingredient)}
            pantry={pantry}
          />
        </Stack>
      </Flex>
    </LikesContext.Provider>
  );
}
