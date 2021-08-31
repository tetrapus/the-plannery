import React from "react";
import Ingredient from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { PlaceholderImage } from "../atoms/PlaceholderImage";
import { Stack } from "../atoms/Stack";
import { Darkmode } from "../styles/Darkmode";

interface Props {
  ingredient: Ingredient;
  status?: string;
  action?: React.ReactElement;
  done: boolean;
  busy: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function IngredientCard({
  ingredient,
  status,
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
      }}
    >
      <Flex
        css={{
          width: 160,
          alignItems: "center",
          margin: 4,
          padding: 4,
          borderRadius: 3,
          position: "relative",
          height: "100%",
          borderBottom: done ? "none" : "1px solid #dedede",
          borderRight: done ? "none" : "1px solid #dedede",
          background: done ? "inherit" : "white",
          opacity: busy ? 0.5 : 1,
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
            css={{ height: 48, width: 48 }}
            alt={ingredient.type.name}
            onError={(e) => (e.currentTarget.style.display = "none")}
          ></img>
        ) : (
          <PlaceholderImage />
        )}

        <Stack
          css={{
            alignItems: "flex-start",
            paddingLeft: 8,
          }}
        >
          <div
            css={{ color: "#666", fontSize: 14, [Darkmode]: { color: "#aaa" } }}
          >
            {status}
          </div>
          <div>{ingredient.type.name}</div>
        </Stack>
        {action}
      </Flex>
    </Stack>
  );
}
