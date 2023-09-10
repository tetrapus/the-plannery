import React from "react";
import Ingredient, { getOptimisedImg } from "../../data/ingredients";
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
  const fullName = ingredient.type.name;
  let note,
    name = fullName;
  // If the full name ends in parentheses, move that to the note
  const match = fullName.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    note = match[2];
    name = match[1];
  }
  // If the name has a comma, move everything after the first comma to the note AFTER the first "and"
  const match2 =
    name.match(/^(.*?and.*?)\s*,\s*(.*?)\s*$/) ||
    name.match(/^(.*?),\s*(.*?)\s*$/);
  if (match2) {
    note = match2[2];
    name = match2[1];
  }

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
            src={getOptimisedImg(ingredient.type.imageUrl, 24, 24)}
            css={{ height: 24, width: 24 }}
            alt={ingredient.type.name}
            onError={(e) => (e.currentTarget.style.display = "none")}
          ></img>
        ) : null}

        <Stack
          css={{
            alignItems: "flex-start",
            paddingLeft: 8,
            fontSize: 12,
            display: "flex",
          }}
        >
          <div>
            <span
              css={{
                color: "#666",
                [Darkmode]: { color: "#aaa" },
                display: true ? "inline" : "block",
              }}
            >
              {status}{" "}
            </span>
            <span
              css={{
                display: true ? "inline" : "block",
                color: pinned ? "#666" : "black",
                [Darkmode]: {
                  color: pinned ? "#aaa" : "white",
                },
              }}
            >
              {name}
            </span>
          </div>
          <div
            css={{
              color: "#666",
              [Darkmode]: { color: "#aaa" },
              fontStyle: "italic",
            }}
          >
            {note}
          </div>
        </Stack>
        {action}
      </Flex>
    </Stack>
  );
}
