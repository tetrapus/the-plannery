import { css } from "@emotion/core";
import { faHeart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LikesContext } from "../../data/likes";
import { Recipe } from "../../data/recipes";
import { CardStyle } from "../atoms/Card";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Breakpoint } from "../styles/Breakpoint";
import { AuthStateContext } from "../../data/auth-state";

interface Props {
  recipe: Recipe;
  children: React.ReactNode;
}

export function RecipeCard({ recipe, children }: Props) {
  const { currentUser, household } = useContext(AuthStateContext);
  const like = useContext(LikesContext).find(
    (like) => like.slug === recipe.slug
  );

  if (!recipe) {
    return null;
  }

  return (
    <Flex>
      <Link to={`/recipes/${recipe.slug}`} className="RecipeCard">
        <Flex
          css={css(CardStyle, {
            width: 600,
            alignItems: "center",
            marginBottom: 16,
            position: "relative",

            [Breakpoint.TABLET]: {
              width: "100vw",
              marginBottom: 0,
            },

            [Breakpoint.MOBILE]: {
              flexDirection: "column",
              height: "auto",
              width: "100%",
              marginBottom: 16,
            },
          })}
        >
          <img
            src={recipe.imageUrl}
            css={{
              width: 150,
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              bottom: 0,

              [Breakpoint.MOBILE]: {
                width: "100%",
                height: 100,
                position: "relative",
              },
            }}
            alt={recipe.name}
          />
          <div
            css={{
              minWidth: 150,
              [Breakpoint.MOBILE]: { display: "none" },
            }}
          ></div>
          <FontAwesomeIcon
            icon={faHeart}
            css={{
              color: like ? "hotpink" : "white",
              position: "absolute",
              left: 4,
              bottom: 4,
              ".RecipeCard:not(:hover) &": like ? {} : { display: "none" },
            }}
            onClick={(e) => {
              if (like) {
                like.ref.delete();
              } else {
                household?.ref
                  ?.collection("likes")
                  .add({ slug: recipe.slug, by: currentUser.uid });
              }
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
          <div
            css={{
              display: "none",
              [Breakpoint.TABLET]: { display: "inherit" },
            }}
          >
            {children}
          </div>
        </Flex>
      </Link>
      <div css={{ [Breakpoint.TABLET]: { display: "none" } }}>{children}</div>
    </Flex>
  );
}
