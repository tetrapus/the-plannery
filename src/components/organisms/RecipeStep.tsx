import { css } from "@emotion/core";
import React from "react";
import ReactMarkdown from "react-markdown";
import Ingredient from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { IngredientList } from "./IngredientList";
import { Breakpoint } from "../styles/Breakpoint";

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
      css={{
        marginBottom: 16,
        minHeight: 100,
        alignItems: "center",
        position: "relative",
        "&:not(:last-child)": {
          borderBottom: "1px solid #eee",
          paddingBottom: 8,
        },
        [Breakpoint.MOBILE]: {
          flexDirection: "column",
        },
      }}
    >
      <h1
        css={{
          position: "absolute",
          left: -48,
          margin: 0,

          [Breakpoint.TABLET]: {
            left: 4,
          },
        }}
      >
        {stepNumber}
      </h1>
      <div css={{ marginRight: "8px" }}>
        {step.images.map((img) => (
          <img
            key={img}
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
