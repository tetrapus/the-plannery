import { css } from "@emotion/core";
import { faSearch, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Ingredient, { denormaliseIngredient } from "../../data/ingredients";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";

interface Props {
  ingredient: Ingredient;
  pantryRef?: firebase.firestore.DocumentReference;
  onClick: () => void;
}

export function IngredientCard({ ingredient, pantryRef, onClick }: Props) {
  const displayAmount = denormaliseIngredient(ingredient);

  return (
    <Flex
      css={css`
        width: 180px;
        align-items: center;
        margin: 4px;
        padding: 4px;
        border-radius: 3px;
        position: relative;
      `}
      style={{
        background: pantryRef ? "inherit" : "white",
        boxShadow: pantryRef ? "inherit" : "grey 1px 1px 4px",
      }}
      onClick={onClick}
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
          {displayAmount?.qty} {displayAmount?.unit}
        </div>
        <div>{ingredient.type.name}</div>
      </Stack>
      {pantryRef && (ingredient.qty || ingredient.unit) ? (
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
          onClick={(e) => {
            pantryRef.update({
              "ingredient.qty": null,
              "ingredient.unit": null,
            });
            e.stopPropagation();
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
  );
}
