import { css } from "@emotion/core";
import React from "react";
import Ingredient from "../../models/Ingredient";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  return (
    <div
      css={css`
        display: flex;
        width: 180px;
        align-items: center;
        background: white;
      `}
    >
      <img
        src={ingredient.type.imageUrl}
        css={css`
          height: 48px;
          width: 48px;
        `}
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
          {ingredient.qty} {ingredient.unit}
        </div>
        <div>{ingredient.type.name}</div>
      </div>
    </div>
  );
}
