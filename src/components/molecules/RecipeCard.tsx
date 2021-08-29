import { css } from "@emotion/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Button } from "components/atoms/Button";
import { IconButton } from "components/atoms/IconButton";
import { Darkmode } from "components/styles/Darkmode";
import React, { useContext, useRef, useState } from "react";
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

export interface RecipeAction {
  icon: IconProp;
  onClick: (recipe: Recipe) => (e: React.MouseEvent | React.TouchEvent) => void;
}
interface Props {
  recipe: Recipe;
  dismiss?: RecipeAction;
  select?: RecipeAction;
  [key: string]: any;
}

function RecipeActions({
  dismiss,
  select,
  recipe,
}: {
  dismiss?: RecipeAction;
  select?: RecipeAction;
  recipe: Recipe;
}) {
  return (
    <Stack
      css={{
        fontSize: 36,
        marginLeft: 16,
        color: "grey",
        height: "100%",
        flexDirection: "column",
        width: 100,
        borderLeft: "1px solid #e0e0e0",

        [Darkmode]: {
          borderLeft: "1px solid #333",
        },

        [Breakpoint.MOBILE]: {
          margin: "auto",
          flexDirection: "row",
          width: "66%",
          borderLeft: "none",
        },
      }}
    >
      {[dismiss, select].map((action, idx) => {
        if (!action) {
          return null;
        }
        return (
          <Button key={idx} onClick={action.onClick(recipe)}>
            <IconButton
              icon={action.icon}
              css={{ margin: "auto", padding: 8 }}
            />
          </Button>
        );
      })}
    </Stack>
  );
}

export function RecipeCard({ recipe, dismiss, select, ...rest }: Props) {
  const like = useContext(LikesContext);
  const pantry = useContext(PantryContext);
  const ref = useRef<HTMLDivElement>(null);

  const [touchOffset, setTouchOffset] = useState<
    { origin: number; value: number } | undefined
  >();

  if (!recipe) {
    return null;
  }

  const pantryIngredients = recipe.ingredients.filter((ingredient) =>
    inPantry(ingredient, pantry)
  ).length;

  return (
    <Flex {...rest} ref={ref}>
      <Link
        to={`/recipes/${recipe.slug}`}
        className="RecipeCard"
        css={{
          [Breakpoint.MOBILE]: {
            width: "45vw",
            margin: "2.5vw",
            minWidth: 125,
            position: "initial",
          },
          position: "relative",
        }}
        style={{
          left:
            touchOffset?.value && touchOffset?.value > 0
              ? touchOffset.value
              : 0,
        }}
      >
        <Flex
          css={css(CardStyle, {
            width: 750,
            minHeight: 125,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",

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
            style={{
              opacity:
                touchOffset && touchOffset.value < 0
                  ? 1 - touchOffset.value / -150
                  : 1,
            }}
            alt={recipe.name}
          />
          <div
            css={{
              color: "white",
              position: "absolute",
              top: 0,
              left: 0,
              background: {
                Easy: "#4fb55d",
                Moderate: "#007fed",
                Hard: "#363f4d",
                Expert: "#000",
              }[recipe.difficulty || "Expert"],
              fontSize: 10,
              padding: "2px 4px",
              borderBottomRightRadius: 2,
            }}
          >
            {recipe.difficulty}
          </div>
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
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 125,
              background: "white",
              [Darkmode]: {
                background: "black",
              },
              [Breakpoint.MOBILE]: {
                position: "initial",
              },
            }}
            style={{
              left:
                touchOffset?.value && touchOffset?.value < 0
                  ? touchOffset.value
                  : 0,
            }}
            onTouchStart={(event) => {
              if (window.innerWidth > 480) {
                setTouchOffset({ origin: event.touches[0].clientX, value: 0 });
                console.log(touchOffset);
              }
            }}
            onTouchMove={(event) => {
              if (!touchOffset) {
                return;
              }
              console.log(touchOffset);
              let value = event.touches[0].clientX - touchOffset.origin;
              if ((!select && value < 0) || (!dismiss && value > 0)) {
                value = 0;
              }

              setTouchOffset({
                ...touchOffset,
                value: Math.max(value, -150),
              });
            }}
            onTouchEnd={(e) => {
              if (!touchOffset) {
                return;
              }
              if (touchOffset.value < 0.85 * -150 && select) {
                console.log("selected");
                select.onClick(recipe)(e);
              } else if (
                touchOffset.value > (ref.current?.offsetWidth || 0) * 0.5 &&
                dismiss
              ) {
                console.log("dismissed");

                dismiss.onClick(recipe)(e);
              }
              setTouchOffset(undefined);
              console.log(touchOffset);
            }}
          >
            <Stack
              css={{
                padding: "12px 4px",
                margin: "12px auto",
                alignItems: "center",
                textAlign: "center",
                fontSize: 24,
                flexGrow: 1,
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
                  [Breakpoint.MOBILE]: {
                    position: "initial",
                    marginTop: "auto",
                  },
                }}
              >
                {recipe.prepTime}m &middot; {recipe.serves} serves{" "}
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
          </Stack>
          <div
            css={{
              [Breakpoint.MOBILE]: { width: "100%" },
            }}
          >
            <RecipeActions recipe={recipe} dismiss={dismiss} select={select} />
          </div>
        </Flex>
      </Link>
    </Flex>
  );
}
