import { css } from "@emotion/core";
import React from "react";
import ReactMarkdown from "react-markdown";
import Ingredient from "../../models/Ingredient";
import { Flex } from "../atoms/Flex";
import { IngredientList } from "./IngredientList";

interface Step {
  images: string[];
  method: string;
}

interface Props {
  step: Step;
  stepNumber: number;
  ingredients: Ingredient[];
}

export function RecipeStep({ step, stepNumber, ingredients }: Props) {
  return (
    <Flex
      css={css`
        margin-bottom: 16px;
        min-height: 100px;
        align-items: center;
        position: relative;
        &:not(:last-child) {
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        @media only screen and (max-width: 768px) {
          flex-direction: column;
        }
      `}
    >
      <h1
        css={css`
          position: absolute;
          left: -48px;
          margin: 0;

          @media only screen and (max-width: 768px) {
            left: 0;
            top: 0;
          }
        `}
      >
        {stepNumber}
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
        <IngredientList
          ingredients={ingredients}
          pantry={{ items: [] }}
        ></IngredientList>
      </div>
    </Flex>
  );
}
