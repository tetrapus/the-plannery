import { css } from "@emotion/core";
import React from "react";
import { denormaliseIngredient } from "../../data/ingredients";
import Ingredient from "../../models/Ingredient";

interface Props {
  ingredient: Ingredient;
  inPantry: boolean;
  onClick: () => void;
}

export function IngredientCard({ ingredient, inPantry, onClick }: Props) {
  const displayAmount = denormaliseIngredient(ingredient);

  return (
    <div
      css={css`
        display: flex;
        width: 180px;
        align-items: center;
        margin: 2px;
        padding: 2px;
        border-radius: 3px;
      `}
      style={{
        background: inPantry ? "inherit" : "white",
        boxShadow: inPantry ? "inherit" : "grey 1px 1px 4px",
      }}
      onClick={onClick}
    >
      <img
        src={ingredient.type.imageUrl}
        css={css`
          height: 48px;
          width: 48px;
        `}
        alt={ingredient.type.name}
      ></img>

      <div
        css={css`
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 12px;
        `}
      >
        <div>
          {displayAmount.qty} {displayAmount.unit}
        </div>
        <div>{ingredient.type.name}</div>
      </div>
    </div>
  );
}
