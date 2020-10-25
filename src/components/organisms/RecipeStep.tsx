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
  state?: { state: "done" | "claimed"; by: string };
  users: any;
  [key: string]: any;
}

export function RecipeStep({
  step,
  stepNumber,
  ingredients,
  state,
  users,
  ...rest
}: Props) {
  return (
    <Flex
      css={{
        marginBottom: 16,
        marginLeft: 16,
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
        opacity: state?.state === "done" ? 0.5 : 1,
      }}
      {...rest}
    >
      <h1
        css={{
          position: "absolute",
          left: -56,
          margin: 0,

          [Breakpoint.TABLET]: {
            left: -12,
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
        {state && state.state === "claimed" ? (
          <Flex css={{ alignItems: "center", fontWeight: "bold" }}>
            <img
              src={users[state.by].photoURL}
              css={{ width: 32, marginRight: 8 }}
              alt=""
            />
            {users[state.by].displayName}
          </Flex>
        ) : null}
        <ReactMarkdown>{step.method}</ReactMarkdown>
        <IngredientList ingredients={ingredients} />
      </div>
    </Flex>
  );
}
