import { css } from "@emotion/core";
import { faSearch, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import Ingredient, { denormaliseIngredient } from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";
import { PantryItem } from "../../data/pantry";
import { AuthStateContext } from "../../data/auth-state";

interface Props {
  ingredient: Ingredient;
  pantryItem?: PantryItem | null;
}

export function IngredientCard({ ingredient, pantryItem }: Props) {
  const [busy, setBusy] = useState<boolean>(false);
  const { household, insertMeta } = useContext(AuthStateContext);

  const displayAmount = denormaliseIngredient(ingredient);

  const complete =
    pantryItem &&
    (!pantryItem.ingredient.qty ||
      (ingredient.qty && pantryItem.ingredient.qty >= ingredient.qty));
  const displayPantryAmount =
    !complete && pantryItem
      ? denormaliseIngredient(pantryItem.ingredient, displayAmount?.unit)
      : undefined;

  const togglePantry = async () => {
    if (!household?.ref || pantryItem === null) {
      return;
    }
    if (pantryItem) {
      if (complete) {
        if (pantryItem.ingredient.qty) {
          if (ingredient.qty && ingredient.qty < pantryItem.ingredient.qty) {
            await pantryItem.ref.set({
              ingredient: {
                qty: pantryItem.ingredient.qty - ingredient.qty,
                type: ingredient.type,
                unit: ingredient.unit,
              },
              ...insertMeta,
            });
          } else {
            await pantryItem.ref.delete();
          }
        }
      } else {
        await pantryItem.ref.set({
          ingredient: {
            qty: ingredient.qty,
            type: ingredient.type,
            unit: ingredient.unit,
          },
          ...insertMeta,
        });
      }
    } else {
      await household.ref.collection("pantry").add({
        ingredient: {
          qty: ingredient.qty,
          type: ingredient.type,
          unit: ingredient.unit,
        },
        ...insertMeta,
      });
    }
  };

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
        }}
        style={{
          background: complete ? "inherit" : "white",
          boxShadow: complete ? "inherit" : "grey 1px 1px 4px",
          opacity: busy || pantryItem === null ? 0.5 : 1,
        }}
        onClick={async (e) => {
          setBusy(true);
          try {
            await togglePantry();
          } catch {}
          setBusy(false);
        }}
        className="IngredientCard"
      >
        <img
          src={ingredient.type.imageUrl}
          css={css`
            height: 48px;
            width: 48px;
          `}
          alt={ingredient.type.name}
        ></img>

        <Stack
          css={css`
            align-items: flex-start;
            padding-left: 12px;
          `}
        >
          <div css={{ color: "#555", fontStyle: "italic" }}>
            {displayPantryAmount ? <>{displayPantryAmount.qty}/</> : null}
            {displayAmount?.qty}{" "}
            {displayAmount?.unit !== "unit" ? displayAmount?.unit : null}
          </div>
          <div>{ingredient.type.name}</div>
        </Stack>
        {pantryItem && (ingredient.qty || ingredient.unit) ? (
          <FontAwesomeIcon
            icon={faThumbtack}
            css={{
              position: "absolute",
              left: 0,
              top: 0,
              "&:hover": { color: "black" },
              ".IngredientCard:not(:hover) &": { display: "none" },
            }}
            color="grey"
            onClick={async (e) => {
              e.stopPropagation();
              setBusy(true);
              try {
                await pantryItem.ref.update({
                  "ingredient.qty": null,
                  "ingredient.unit": null,
                });
              } catch {}
              setBusy(false);
            }}
          />
        ) : (
          <a
            href={`https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURI(
              ingredient.type.name
            )}&sortBy=TraderRelevance`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <FontAwesomeIcon
              icon={faSearch}
              css={{
                position: "absolute",
                right: 2,
                top: 2,
                "&:hover": { color: "black" },
                ".IngredientCard:not(:hover) &": { display: "none" },
              }}
              color="grey"
            />
          </a>
        )}
      </Flex>
      {false && ingredient.usedIn ? (
        <Flex>
          {ingredient.usedIn?.map((recipe) => (
            <div key={recipe.slug}>
              <img src={recipe.imageUrl} width={32} alt="" />
            </div>
          ))}
        </Flex>
      ) : null}
    </Stack>
  );
}
