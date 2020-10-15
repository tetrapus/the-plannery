import React from "react";
import { Recipe } from "../../models/Recipe";
import { css } from "@emotion/core";
import ReactMarkdown from "react-markdown";
import { TagList } from "../molecules/TagList";
import { Stack } from "../atoms/Stack";
import { IngredientList } from "../organisms/IngredientList";

interface Props {
  recipe: Recipe;
}

export default function RecipeTemplate({ recipe }: Props) {
  console.log(recipe);
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
        <IngredientList ingredients={recipe.ingredients} />
        <h2>Utensils</h2>
        <TagList items={recipe.utensils}></TagList>
        <h2>Method</h2>
        <div>
          {recipe.steps.map((step, idx) => (
            <div
              key={idx}
              css={css`
                margin-bottom: 16px;
                display: flex;
                min-height: 100px;
                align-items: center;
                &:not(:last-child) {
                  border-bottom: 1px solid #eee;
                  padding-bottom: 8px;
                }
              `}
            >
              <h1
                css={css`
                  position: absolute;
                  left: -36px;
                  margin: 0;
                `}
              >
                {idx + 1}
              </h1>
              <div css={{ marginRight: "8px" }}>
                {step.images.map((img) => (
                  <img
                    src={img}
                    css={css`
                      width: 250px;
                    `}
                    alt=""
                  ></img>
                ))}
              </div>
              <div
                css={css`
                  padding: 16px 8px;
                `}
              >
                <ReactMarkdown>{step.method}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
