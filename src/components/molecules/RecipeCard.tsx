import { css } from "@emotion/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Button } from "components/atoms/Button";
import { IconButton } from "components/atoms/IconButton";
import { Tooltip } from "components/atoms/Tooltip";
import { Darkmode } from "components/styles/Darkmode";
import { getOptimisedImg, IngredientAmount } from "data/ingredients";
import React, { ReactNode, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LikesContext } from "../../data/likes";
import { inPantry, Pantry, PantryContext } from "../../data/pantry";
import {
  partitionBy,
  Preference,
  Recipe,
  RecommendReason,
} from "../../data/recipes";
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
          justifyContent: "center",
          [Darkmode]: {
            borderLeft: "none",
          },
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

  const [touchOffset] = useState<
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
            src={getOptimisedImg(recipe.imageUrl, 300)}
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
            onError={(e) => (e.currentTarget.style.display = "none")}
            alt={recipe.name}
          />
          <RecipeDifficultyTag recipe={recipe} />
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
          >
            <Stack
              css={{
                alignItems: "center",
                textAlign: "center",
                fontSize: 24,
                flexGrow: 1,
                [Breakpoint.MOBILE]: {
                  margin: "auto",
                  fontSize: 16,
                },
              }}
            >
              <Stack
                css={{
                  padding: 12,
                  margin: "auto",
                  [Breakpoint.MOBILE]: { padding: "8px 2px" },
                }}
              >
                <div css={{ fontSize: "1em" }}>{recipe.name}</div>
                <div css={{ fontSize: "0.8em", fontWeight: "lighter" }}>
                  {recipe.subtitle}
                </div>
              </Stack>
              <Flex css={{ marginTop: "auto", marginBottom: 8 }}>
                <RecipeDetails {...{ recipe, pantry, pantryIngredients }} />
              </Flex>
            </Stack>
          </Stack>
          <div
            css={{
              [Breakpoint.MOBILE]: { width: "100%" },
            }}
          >
            <RecipeActions {...{ recipe, dismiss, select }} />
          </div>
        </Flex>
      </Link>
    </Flex>
  );
}

function RecipeDetails({
  recipe,
  pantry,
  pantryIngredients,
}: {
  recipe: Recipe;
  pantry: Pantry | undefined;
  pantryIngredients: number;
}) {
  const reasonProcessors: {
    [key in Preference["type"]]: (reason: RecommendReason) => ReactNode;
  } = {
    ingredient: (reason) => {
      const ingredient = recipe.ingredients.find(
        (ingredient) => ingredient.type.id === reason.value
      );
      if (!ingredient || !ingredient.type.imageUrl) {
        return null;
      }
      return (
        <Tooltip
          text={`${IngredientAmount({ ingredient })} ${ingredient.type.name}`}
        >
          <img
            src={getOptimisedImg(ingredient.type.imageUrl, 24, 24)}
            alt=""
            width={24}
            height={24}
            css={{
              "&:not(:first-child)": {
                marginLeft: 4,
              },
              "&:not(:hover)": {
                opacity: 0.8,
              },
            }}
          ></img>
        </Tooltip>
      );
    },
    recent: () => "Recently cooked",
    trash: () => "In trash",
    tag: (reason) => `#${reason.value}`,
    equipment: (reason) => reason.value,
    easy: () => null,
    fast: () => null,
    liked: () => null,
    "ready-to-cook": () => null,
  };

  const positives = [<>{recipe.prepTime}m</>];
  const negatives = [];
  if (pantry) {
    positives.push(
      pantryIngredients === recipe.ingredients.length ? (
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
      )
    );
  }

  if (recipe.recommendReasons) {
    const pluses = recipe.recommendReasons.filter(
      (reason) => reason.effect > 0
    );
    const minuses = recipe.recommendReasons.filter(
      (reason) => reason.effect < 0
    );
    const plusesList = partitionBy(pluses, "type");
    const minusesList = partitionBy(minuses, "type");
    positives.push(
      ...Object.values(plusesList)
        .map((reasons) =>
          reasons
            .map((reason) => reasonProcessors[reason.type](reason))
            .filter((x) => x)
        )
        .filter((x) => x.length)
        .map((x) => <>{x}</>)
    );
    negatives.push(
      ...Object.values(minusesList)
        .map((reasons) =>
          reasons
            .map((reason) => reasonProcessors[reason.type](reason))
            .filter((x) => x)
        )
        .filter((x) => x.length)
        .map((x) => <>{x}</>)
    );
  }

  return (
    <Flex
      css={{
        color: "grey",
        marginLeft: 8,
        marginRight: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        fontSize: 14,
        alignItems: "center",
        [Breakpoint.MOBILE]: {
          position: "initial",
        },
      }}
    >
      {positives.map((elem) => (
        <Flex
          css={{
            alignItems: "center",
            "&:not(:first-child):before": {
              content: '"·"',
              margin: 4,
            },
          }}
        >
          {elem}
        </Flex>
      ))}
      {negatives.map((elem) => (
        <Flex
          css={{
            color: "red",
            alignItems: "center",
            "&:not(:first-child):before": {
              content: '"×"',
              margin: 4,
            },
          }}
        >
          {elem}
        </Flex>
      ))}
    </Flex>
  );
}

function RecipeDifficultyTag({ recipe }: { recipe: Recipe }) {
  return (
    <div
      css={{
        color: "white",
        position: "absolute",
        top: 4,
        left: 4,
        background: {
          Easy: "#4fb55d",
          Moderate: "#007fed",
          Hard: "#363f4d",
          Expert: "#000",
        }[recipe.difficulty || "Expert"],
        fontSize: 10,
        padding: "2px 4px",
        borderRadius: 4,
      }}
    >
      {recipe.difficulty}
    </div>
  );
}
