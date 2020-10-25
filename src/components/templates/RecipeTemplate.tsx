import React, { useContext, useEffect, useState } from "react";
import { css } from "@emotion/core";
import ReactMarkdown from "react-markdown";
import { TagList } from "../molecules/TagList";
import { Stack } from "../atoms/Stack";
import { IngredientList } from "../organisms/IngredientList";
import { RecipeStep } from "../organisms/RecipeStep";
import { Recipe } from "../../data/recipes";
import Ingredient from "../../data/ingredients";
import { AuthStateContext } from "../../data/auth-state";
import { Pantry, PantryItem } from "../../data/pantry";
import { LikeButton } from "../molecules/LikeButton";
import {
  faChevronDown,
  faChevronUp,
  faPlayCircle,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import { Flex } from "../atoms/Flex";
import { IconButton } from "../atoms/IconButton";

interface Props {
  recipe: Recipe;
}

interface State {
  pantry?: Pantry;
}

interface Session {
  by: string;
  ref: firebase.firestore.DocumentReference;
  steps: {
    [step: string]: {
      state: "done" | "claimed";
      by: string;
    };
  };
}

export default function RecipeTemplate({ recipe }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const [{ pantry }, setState] = useState<State>({});
  const [session, setSession] = useState<Session | undefined>();
  const [users, setUsers] = useState<any>({});
  const [ingredientsExpanded, setIngredientsExpanded] = useState<boolean>(
    false
  );

  useEffect(
    () =>
      household?.ref.collection("pantry").onSnapshot((snapshot) =>
        setState((state) => ({
          ...state,
          pantry: {
            items: snapshot.docs.map(
              (doc) => ({ ref: doc.ref, ...doc.data() } as PantryItem)
            ),
          },
        }))
      ),
    [household]
  );
  useEffect(
    () =>
      household?.ref
        .collection("users")
        .onSnapshot((snapshot) =>
          setUsers(
            Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]))
          )
        ),
    [household]
  );
  useEffect(
    () =>
      household?.ref
        .collection("sessions")
        .doc(recipe.slug)
        .onSnapshot((snapshot) =>
          setSession(
            snapshot.exists
              ? { ...(snapshot.data() as Session), ref: snapshot.ref }
              : undefined
          )
        ),
    [household, recipe.slug]
  );

  if (!household) {
    return null;
  }

  return (
    <div>
      <img
        src={recipe.imageUrl}
        css={css`
          width: 100vw;
          height: 40vh;
          object-fit: cover;
        `}
        alt={recipe.name}
      ></img>
      <div
        css={css`
          background-color: white;
          max-width: 800px;
          margin: auto;
          position: relative;
          top: -15vh;
          min-height: 100vh;
          padding: 12px;
          box-shadow: gray 1px 1px 4px;
          border-radius: 2px;
        `}
      >
        <Stack css={{ alignItems: `center` }}>
          <a
            href={recipe.url}
            css={css`
              color: #2259b5;
              text-decoration: none;
            `}
          >
            <h1 css={{ margin: "12px 24px" }}>{recipe.name}</h1>
          </a>
          <LikeButton
            recipe={recipe}
            css={{ position: "absolute", top: 16, right: 16, fontSize: 24 }}
          />
          <h2 css={{ margin: 0 }}>{recipe.subtitle}</h2>
        </Stack>

        <ReactMarkdown>{recipe.description}</ReactMarkdown>
        <TagList items={recipe.tags}></TagList>
        {!session ? <h2>Ingredients</h2> : null}
        <Flex
          css={css(
            session
              ? {
                  position: "fixed",
                  top: 0,
                  background: "white",
                  left: 0,
                  zIndex: 100,
                  borderBottom: "1px solid grey",
                  overflow: "scroll",
                  width: "100vw",
                }
              : {},
            { alignItems: "center" }
          )}
        >
          {session ? (
            <IconButton
              icon={ingredientsExpanded ? faChevronUp : faChevronDown}
              onClick={() => setIngredientsExpanded((value) => !value)}
            />
          ) : null}
          <IngredientList
            ingredients={recipe.ingredients}
            sortKey={(ingredient: Ingredient) =>
              recipe.steps
                .map((step) => step.method)
                .join("\n")
                .toLowerCase()
                .indexOf(ingredient.type.name.toLowerCase())
            }
            pantry={pantry}
            css={session && !ingredientsExpanded ? { flexWrap: "nowrap" } : {}}
          />
        </Flex>
        <h2>Utensils</h2>
        <TagList items={recipe.utensils}></TagList>
        <h2>
          <Flex>
            Method
            <IconButton
              icon={session ? faStopCircle : faPlayCircle}
              onClick={() =>
                session
                  ? session.ref.delete()
                  : household.ref
                      .collection("sessions")
                      .doc(recipe.slug)
                      .set({ ...insertMeta, steps: {} })
              }
            />
          </Flex>
        </h2>
        <div>
          {recipe.steps.map((step, idx) => (
            <RecipeStep
              key={idx}
              step={step}
              stepNumber={idx + 1}
              users={users}
              ingredients={step.ingredients
                .map((ingredient) =>
                  recipe.ingredients.find(
                    (recipeIngredient) =>
                      recipeIngredient.type.id === ingredient
                  )
                )
                .filter(
                  (ingredient): ingredient is Ingredient =>
                    ingredient !== undefined
                )}
              state={session?.steps ? session?.steps[`${idx}`] : undefined}
              onClick={() => {
                if (!session) {
                  return;
                }
                if (!session.steps[`${idx}`]) {
                  session.ref.update({
                    [`steps.${idx}`]: { ...insertMeta, state: "claimed" },
                  });
                } else if (session.steps[`${idx}`].state === "done") {
                  session.ref.update({
                    [`steps.${idx}`]: firebase.firestore.FieldValue.delete(),
                  });
                } else if (session.steps[`${idx}`].state === "claimed") {
                  session.ref.update({
                    [`steps.${idx}`]: { ...insertMeta, state: "done" },
                  });
                }
              }}
            ></RecipeStep>
          ))}
        </div>
      </div>
    </div>
  );
}
