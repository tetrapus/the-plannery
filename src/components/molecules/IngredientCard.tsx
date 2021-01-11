import React from "react";
import Ingredient from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { PlaceholderImage } from "../atoms/PlaceholderImage";
import { Stack } from "../atoms/Stack";

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
    <Stack>
      <Flex
        css={{
          width: 180,
          alignItems: "center",
          margin: 4,
          padding: 4,
          borderRadius: 3,
          position: "relative",
          height: "100%",
          borderBottom: "1px solid #dedede",
        }}
        style={{
          background: done ? "inherit" : "white",
          opacity: busy ? 0.5 : 1,
        }}
        onClick={onClick}
        className="IngredientCard"
      >
        {ingredient.type.imageUrl ? (
          <img
            src={ingredient.type.imageUrl}
            css={{ height: 48, width: 48 }}
            alt={ingredient.type.name}
          ></img>
        ) : (
          <PlaceholderImage />
        )}

        <Stack
          css={{
            alignItems: "flex-start",
            paddingLeft: 12,
          }}
        >
          <div css={{ color: "#555", fontStyle: "italic" }}>{status}</div>
          <div>{ingredient.type.name}</div>
        </Stack>
        {action}
      </Flex>
    </Stack>
  );
}
