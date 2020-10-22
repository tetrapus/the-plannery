import React, { useContext, useEffect, useState } from "react";
import { RecipeCard } from "../molecules/RecipeCard";
import { Stack } from "../atoms/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { Flex } from "../atoms/Flex";
import {
  getIngredientsForMealPlan,
  MealPlan,
  MealPlanItem,
} from "../../data/meal-plan";
import {
  getRecipe,
  getSuggestedRecipes,
  Recipe,
  RecipesCollection,
} from "../../data/recipes";
import { IngredientList } from "../organisms/IngredientList";
import { Pantry, PantryItem } from "../../data/pantry";
import { SuggestedRecipesSection } from "../organisms/SuggestedRecipesSection";
import { Spinner } from "../atoms/Spinner";
import { HouseholdContext } from "../../data/household";
import firebase from "firebase";

interface State {
  mealPlan: MealPlan;
  pantry: Pantry;
  recipes: any[];
}

export default function HomeTemplate() {
  const initialState = {
    mealPlan: { recipes: [] },
    pantry: { items: [] },
    recipes: RecipesCollection.initialState,
  };
  const [{ mealPlan, pantry, recipes }, setState] = useState<State>(
    initialState
  );
  const { ref, doc } = useContext(HouseholdContext);
  useEffect(() => {
    const hooks: (() => void)[] = [];
    if (ref) {
      hooks.push(
        ref.collection("mealplan").onSnapshot((snapshot) =>
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
        ref.collection("pantry").onSnapshot((snapshot) =>
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
    }
    RecipesCollection.subscribe((value) =>
      setState((state) => ({ ...state, recipes: value }))
    );
    return () => hooks.forEach((hook) => hook());
  }, [ref]);

  const addUser = React.createRef<HTMLInputElement>();

  return (
    <Flex>
      {recipes.length ? (
        <Stack
          css={{ maxWidth: 800, marginLeft: "auto", placeItems: "flex-start" }}
        >
          {mealPlan.recipes.length ? (
            <>
              <h1>Your meal plan</h1>
              {mealPlan.recipes.map((recipe) => (
                <Flex key={recipe.slug}>
                  <RecipeCard recipe={getRecipe(recipe.slug) as Recipe} />
                  <Stack css={{ fontSize: 36, margin: 42, color: "grey" }}>
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={() => recipe.ref.delete()}
                    />
                  </Stack>
                </Flex>
              ))}
              <h2>Shopping list</h2>
              <IngredientList
                ingredients={getIngredientsForMealPlan(mealPlan)}
                pantry={pantry}
              />
            </>
          ) : null}
          <SuggestedRecipesSection
            recipes={getSuggestedRecipes()}
            mealPlan={mealPlan}
          />
        </Stack>
      ) : (
        <Stack css={{ width: 800, marginLeft: "auto", alignItems: "center" }}>
          <Spinner />
          Downloading recipe database...
        </Stack>
      )}
      <Stack css={{ width: "calc(50vw - 400px)" }}>
        <h2>Invites</h2>
        {doc?.invitees.map((email) => (
          <div key={email} css={{ marginBottom: 4 }}>
            {email}
          </div>
        ))}
        <Flex>
          <input placeholder="Invite by email" ref={addUser}></input>
          <FontAwesomeIcon
            icon={faUserPlus}
            css={{ marginLeft: 8 }}
            onClick={() => {
              if (addUser.current) {
                ref?.update({
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
  );
}
