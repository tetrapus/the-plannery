import { css } from "@emotion/core";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LikesContext } from "../../data/likes";
import { Recipe } from "../../data/recipes";
import { CardStyle } from "../atoms/Card";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Breakpoint } from "../styles/Breakpoint";
import { LikeButton } from "./LikeButton";

interface Props {
  recipe: Recipe;
  children: React.ReactNode;
  [key: string]: any;
}

export function RecipeCard({ recipe, children, ...rest }: Props) {
  const like = useContext(LikesContext);

  if (!recipe) {
    return null;
  }

  return (
    <Flex {...rest}>
      <Link
        to={`/recipes/${recipe.slug}`}
        className="RecipeCard"
        css={{
          [Breakpoint.MOBILE]: {
            width: "45vw",
            margin: "2.5vw",
            minWidth: 125,
          },
        }}
      >
        <Flex
          css={css(CardStyle, {
            width: 600,
            minHeight: 125,
            alignItems: "center",
            position: "relative",

            [Breakpoint.TABLET_ONLY]: {
              width: "100vw",
              boxShadow: "none",
              borderRadius: 0,
              borderBottom: "1px solid #eee",
            },

            [Breakpoint.MOBILE]: {
              flexDirection: "column",
              height: "100%",
              width: "100%",
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
          <LikeButton
            recipe={recipe}
            css={{
              position: "absolute",
              left: 4,
              bottom: 4,
              ".RecipeCard:not(:hover) &": like ? {} : { display: "none" },
              [Breakpoint.MOBILE]: { top: 80 },
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
            onClick={(e) => e.stopPropagation()}
          />
          <Stack
            css={{
              padding: "12px 4px",
              margin: "8px auto",
              alignItems: "center",
              textAlign: "center",
              fontSize: 24,
              [Breakpoint.MOBILE]: {
                padding: "8px 2px",
                margin: "auto",
                fontSize: 16,
              },
            }}
          >
            <div css={{ fontSize: "1.25em", fontWeight: "bold" }}>
              {recipe.name}
            </div>
            <div css={{ fontSize: "1em" }}>{recipe.subtitle}</div>
            <div
              css={{
                color: "grey",
                fontStyle: "italic",
                position: "absolute",
                bottom: 8,
                right: 8,
                fontSize: 14,
              }}
            >
              {recipe.serves} serves
            </div>
          </Stack>
          <div
            css={{
              display: "none",
              [Breakpoint.TABLET]: { display: "inherit" },
              [Breakpoint.MOBILE]: {
                flexDirection: "row",
                width: "50vw",
                marginBottom: 24,
              },
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
