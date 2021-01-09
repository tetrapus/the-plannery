import { css } from "@emotion/core";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LikesContext } from "../../data/likes";
import { inPantry, PantryContext } from "../../data/pantry";
import { Recipe } from "../../data/recipes";
import { CardStyle } from "../atoms/Card";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { Breakpoint } from "../styles/Breakpoint";
import { LikeButton } from "./LikeButton";
import { TrashButton } from "./TrashButton";

interface Props {
  recipe: Recipe;
  children: React.ReactNode;
  [key: string]: any;
}

export function RecipeCard({ recipe, children, ...rest }: Props) {
  const like = useContext(LikesContext);
  const pantry = useContext(PantryContext);

  if (!recipe) {
    return null;
  }

  const pantryIngredients = recipe.ingredients.filter((ingredient) =>
    inPantry(ingredient, pantry)
  ).length;

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
          <TrashButton
            recipe={recipe}
            css={{
              position: "absolute",
              right: 8,
              top: 8,
              ".RecipeCard:not(:hover) &": { display: "none" },
            }}
          />
          <Stack
            css={{
              padding: "12px 4px",
              margin: "12px auto",
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
              {pantry ? (
                <>
                  {" "}
                  &middot;{" "}
                  {pantryIngredients === recipe.ingredients.length ? (
                    <>Ready to cook</>
                  ) : (
                    <>
                      {
                        recipe.ingredients.filter((ingredient) =>
                          inPantry(ingredient, pantry)
                        ).length
                      }
                      /{recipe.ingredients.length} items
                    </>
                  )}
                </>
              ) : null}
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
