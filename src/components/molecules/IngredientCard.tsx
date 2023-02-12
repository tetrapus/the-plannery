import React from "react";
import Ingredient from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Darkmode } from "../styles/Darkmode";

interface Props {
  ingredient: Ingredient;
  status?: string;
  pinned?: boolean;
  action?: React.ReactElement;
  done?: boolean;
  busy?: boolean;
  compact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function IngredientCard({
  ingredient,
  status,
  pinned,
  action,
  done,
  busy,
  onClick,
}: Props) {
  return (
    <Stack
      css={{
        borderBottom: "1px solid #dedede",
        [Darkmode]: {
          borderBottom: "1px solid #444",
        },
        borderBottomStyle: pinned ? "dashed" : "solid",
      }}
    >
      <Flex
        css={{
          width: 175,
          alignItems: "center",
          margin: 4,
          padding: 4,
          borderRadius: 8,
          position: "relative",
          height: "100%",
          borderBottom: done ? "none" : "1px solid #dedede",
          borderRight: done ? "none" : "1px solid #dedede",
          background: done ? "inherit" : "white",
          opacity: busy ? 0.5 : 1,
          cursor: onClick ? "pointer" : "initial",
          [Darkmode]: {
            background: done ? "inherit" : "#444",
            borderBottom: done ? "none" : "1px solid #000",
            borderRight: done ? "none" : "1px solid #000",
          },
        }}
        onClick={onClick}
        className="IngredientCard"
      >
        {ingredient.type.imageUrl ? (
          <img
            src={ingredient.type.imageUrl}
            css={true ? { height: 24, width: 24 } : { height: 42, width: 42 }}
            alt={ingredient.type.name}
            onError={(e) => (e.currentTarget.style.display = "none")}
          ></img>
        ) : null}

        <Stack
          css={{
            alignItems: "flex-start",
            paddingLeft: 8,
            fontSize: 14,
            display: true ? "block" : "flex",
          }}
        >
          <div
            css={{
              color: "#666",
              [Darkmode]: { color: "#aaa" },
              display: true ? "inline" : "block",
            }}
          >
            {status}{" "}
          </div>
          <div
            css={{
              display: true ? "inline" : "block",
              color: pinned ? "#666" : "black",
            }}
          >
            {ingredient.type.name}
          </div>
        </Stack>
        {action}
      </Flex>
    </Stack>
  );
}
