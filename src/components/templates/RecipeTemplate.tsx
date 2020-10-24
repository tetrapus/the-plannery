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
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";

interface Props {
  recipe: Recipe;
}

interface State {
  pantry?: Pantry;
}

export default function RecipeTemplate({ recipe }: Props) {
  const { household } = useContext(AuthStateContext);
  const [{ pantry }, setState] = useState<State>({});
  const [pinIngredients, setPinIngredients] = useState<boolean>(false);

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
        {!pinIngredients ? (
          <h2>
            Ingredients{" "}
            <FontAwesomeIcon
              icon={faThumbtack}
              css={{ color: "grey", marginLeft: 8 }}
              onClick={() => setPinIngredients((state) => !state)}
            />
          </h2>
        ) : null}
        <IngredientList
          ingredients={recipe.ingredients}
          pantry={pantry}
          css={
            pinIngredients
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
        <h2>Method</h2>
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
