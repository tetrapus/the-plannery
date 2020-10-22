import React from "react";
import { css } from "@emotion/core";
import ReactMarkdown from "react-markdown";
import { TagList } from "../molecules/TagList";
import { Stack } from "../atoms/Stack";
import { IngredientList } from "../organisms/IngredientList";
import { RecipeStep } from "../organisms/RecipeStep";
import { Recipe } from "../../data/recipes";
import Ingredient from "../../data/ingredients";

interface Props {
  recipe: Recipe;
}

export default function RecipeTemplate({ recipe }: Props) {
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
            <h1 css={{ margin: 12 }}>{recipe.name}</h1>
          </a>
          <h2 css={{ margin: 0 }}>{recipe.subtitle}</h2>
        </Stack>

        <ReactMarkdown>{recipe.description}</ReactMarkdown>
        <TagList items={recipe.tags}></TagList>
        <h2>Ingredients</h2>
        <IngredientList
          ingredients={recipe.ingredients}
          pantry={{ items: [] }}
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
