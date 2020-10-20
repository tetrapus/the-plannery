import { css } from "@emotion/core";
import { faSearch, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { denormaliseIngredient } from "../../data/ingredients";
import Ingredient from "../../models/Ingredient";
import { Flex } from "../atoms/Flex";
import { Stack } from "../atoms/Stack";

interface Props {
  ingredient: Ingredient;
  inPantry: boolean;
  onClick: () => void;
}

export function IngredientCard({ ingredient, inPantry, onClick }: Props) {
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
        background: inPantry ? "inherit" : "white",
        boxShadow: inPantry ? "inherit" : "grey 1px 1px 4px",
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
      {inPantry ? (
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
        />
      ) : (
        <a
          href={`https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURI(
            ingredient.type.name
          )}&sortBy=TraderRelevance`}
          target="_blank"
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
