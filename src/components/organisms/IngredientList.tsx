import { LinkButton } from "components/atoms/LinkButton";
import { Stack } from "components/atoms/Stack";
import { Tooltip } from "components/atoms/Tooltip";
import Ingredient, {
  getOptimisedImg,
  IngredientAmount,
  isSameIngredient,
} from "data/ingredients";
import { enoughInPantry, inPantry, PantryContext } from "data/pantry";
import React, { useContext, useState } from "react";
import { Flex } from "../atoms/Flex";
import { Spinner } from "../atoms/Spinner";
import { PantryIngredientCard } from "./PantryIngredientCard";

interface Props {
  ingredients?: Ingredient[];
  sortKey?: (ingredient: Ingredient) => number;
  exclusions?: Ingredient[];
  expanded?: boolean;
  [key: string]: any;
}

export function IngredientList({
  ingredients,
  exclusions,
  expanded,
  sortKey,
  ...rest
}: Props) {
  const originalPantry = useContext(PantryContext);
  const [showStaples, setShowStaples] = useState<boolean>(!!expanded);

  if (ingredients === undefined) {
    return <Spinner />;
  }

  const pantry = {
    ...originalPantry,
    items:
      originalPantry?.items
        .map((item) => {
          const matchingExclusion = exclusions?.find((ingredient) =>
            isSameIngredient(item.ingredient, ingredient)
          );
          if (
            !matchingExclusion ||
            !matchingExclusion.qty ||
            !item.ingredient.qty
          ) {
            return item;
          }
          return {
            ...item,
            ingredient: {
              ...item.ingredient,
              qty: Math.max(item.ingredient.qty - matchingExclusion.qty, 0),
            },
          };
        })
        .filter((x) => x.ingredient.qty !== 0) || [],
  };

  const sortedIngredients = ingredients
    .map((ingredient) => ({
      ingredient,
      inPantry: inPantry(ingredient, pantry),
    }))
    .map((ingredient) => ({
      ...ingredient,
      isStaple: !!(
        ingredient.inPantry &&
        !ingredient.inPantry.ingredient.qty &&
        !ingredient.inPantry.ingredient.unit
      ),
      enoughInPantry: enoughInPantry(
        ingredient.ingredient,
        ingredient.inPantry
      ),
    }))
    .sort((a, b) =>
      a.isStaple === b.isStaple
        ? a.enoughInPantry === b.enoughInPantry
          ? sortKey
            ? sortKey(a.ingredient) - sortKey(b.ingredient)
            : a.ingredient.type.name.localeCompare(b.ingredient.type.name)
          : a.enoughInPantry
          ? 1
          : -1
        : a.isStaple
        ? 1
        : -1
    );

  const prioritisedIngredients = sortedIngredients.filter((x) => !x.isStaple);
  const staples = sortedIngredients.filter((x) => x.isStaple);

  return (
    <Stack>
      <Flex
        css={{
          flexWrap: "wrap",
        }}
        {...rest}
      >
        {prioritisedIngredients.map(({ ingredient, inPantry }) => {
          return (
            <PantryIngredientCard
              key={JSON.stringify(ingredient)}
              ingredient={ingredient}
              pantryItem={inPantry}
            ></PantryIngredientCard>
          );
        })}
      </Flex>
      {staples.length > 0 ? (
        <>
          <LinkButton
            css={{ fontSize: 14, padding: 8, alignSelf: "flex-start" }}
            onClick={(e) => {
              setShowStaples(!showStaples);
            }}
          >
            {showStaples ? (
              <>Pantry Staples ({staples.length})</>
            ) : (
              <Flex css={{ alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>+ {staples.length} pantry staples </div>
                <Flex css={{ flexWrap: "wrap" }}>
                  {staples.map((staple) => (
                    <Tooltip
                      text={`${IngredientAmount({
                        ingredient: staple.ingredient,
                      })} ${staple.ingredient.type.name}`}
                    >
                      <img
                        src={getOptimisedImg(
                          staple.ingredient.type.imageUrl || "#",
                          24,
                          24
                        )}
                        alt=""
                        width={24}
                        height={24}
                        css={{
                          "&:not(:hover)": {
                            opacity: 0.8,
                          },
                        }}
                      ></img>
                    </Tooltip>
                  ))}
                </Flex>
              </Flex>
            )}
          </LinkButton>
          {showStaples ? (
            <Flex
              css={{
                flexWrap: "wrap",
              }}
              {...rest}
            >
              {staples.map(({ ingredient, inPantry }) => {
                return (
                  <PantryIngredientCard
                    key={JSON.stringify(ingredient)}
                    ingredient={ingredient}
                    pantryItem={inPantry}
                  ></PantryIngredientCard>
                );
              })}
            </Flex>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}
