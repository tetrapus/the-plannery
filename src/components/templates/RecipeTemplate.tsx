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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";

interface Props {
  recipe: Recipe;
}

interface State {
  pantry?: Pantry;
}

interface Session {
  by: string;
  ref: firebase.firestore.DocumentReference;
}

export default function RecipeTemplate({ recipe }: Props) {
  const { household, insertMeta } = useContext(AuthStateContext);
  const [{ pantry }, setState] = useState<State>({});
  const [session, setSession] = useState<Session | undefined>();

  console.log(session);

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
        <IngredientList
          ingredients={recipe.ingredients}
          pantry={pantry}
          css={
            session
              ? {
                  position: "fixed",
                  top: 0,
                  background: "white",
                  left: 0,
                  zIndex: 100,
                }
              : {}
          }
        />
        <h2>Utensils</h2>
        <TagList items={recipe.utensils}></TagList>
        <h2>
          Method{" "}
          <FontAwesomeIcon
            icon={session ? faStopCircle : faPlayCircle}
            css={{ marginLeft: 8 }}
            onClick={() =>
              session
                ? session.ref.delete()
                : household.ref
                    .collection("sessions")
                    .doc(recipe.slug)
                    .set({ ...insertMeta })
            }
          />
        </h2>
        <div>
          {recipe.steps.map((step, idx) => (
            <RecipeStep
              key={idx}
              step={step}
              stepNumber={idx + 1}
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
            ></RecipeStep>
          ))}
        </div>
      </div>
    </div>
  );
}
