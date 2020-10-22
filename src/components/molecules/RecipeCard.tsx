import { css } from "@emotion/core";
import { faHeart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LikesCollection } from "../../data/likes";
import { Recipe } from "../../data/recipes";
import { CardStyle } from "../atoms/Card";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";

interface Props {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: Props) {
  const [state, setState] = useState({ likes: LikesCollection.initialState });
  useEffect(() => {
    LikesCollection.subscribe((likes) =>
      setState((state) => ({ ...state, likes }))
    );
  }, []);

  if (!recipe) {
    return null;
  }

  const isLiked = !!state.likes.find((like) => like === recipe.slug);

  return (
    <Link to={`/recipes/${recipe.slug}`} className="RecipeCard">
      <Flex
        css={css`
          height: 120px;
          width: 600px;
          align-items: center;
          margin-bottom: 16px;
          position: relative;
          ${CardStyle}
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
        <FontAwesomeIcon
          icon={faHeart}
          css={{
            color: isLiked ? "hotpink" : "white",
            position: "absolute",
            left: 4,
            bottom: 4,
            ".RecipeCard:not(:hover) &": isLiked ? {} : { display: "none" },
          }}
          onClick={(e) => {
            LikesCollection.set(
              isLiked
                ? state.likes.filter((like) => like !== recipe.slug)
                : [...state.likes, recipe.slug]
            );
            e.stopPropagation();
            e.preventDefault();
          }}
        />
        <FontAwesomeIcon
          icon={faTrash}
          css={{
            color: "#ccc",
            position: "absolute",
            right: 8,
            top: 8,
            ".RecipeCard:not(:hover) &": { display: "none" },
          }}
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
