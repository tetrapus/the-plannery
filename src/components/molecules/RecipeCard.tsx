import { css } from "@emotion/core";
import React from "react";
import { Link } from "react-router-dom";
import { Recipe } from "../../models/Recipe";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";

interface Props {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: Props) {
  if (!recipe) {
    return null;
  }
  return (
    <Link to={`/recipes/${recipe.slug}`}>
      <Flex
        css={css`
          height: 120px;
          border-radius: 3px;
          box-shadow: grey 1px 1px 2px;
          width: 600px;
          background: white;
          align-items: center;
          margin-bottom: 16px;
        `}
      >
        <img
          src={recipe.imageUrl}
          css={css`
            width: 150px;
            height: 100%;
            object-fit: cover;
          `}
          alt={recipe.name}
        />
        <Stack
          css={{
            padding: 12,
            margin: "auto",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div css={{ fontSize: 28, fontWeight: "bold" }}>{recipe.name}</div>
          <div css={{ fontSize: 24 }}>{recipe.subtitle}</div>
        </Stack>
      </Flex>
    </Link>
  );
}
