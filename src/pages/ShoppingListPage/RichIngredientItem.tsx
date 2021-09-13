import { Flex } from "components/atoms/Flex";
import { PlaceholderImage } from "components/atoms/PlaceholderImage";
import { Stack } from "components/atoms/Stack";
import React, { useEffect } from "react";
import { Recipe } from "data/recipes";
import Ingredient from "data/ingredients";
import { PantryItem } from "data/pantry";
import { Breakpoint } from "components/styles/Breakpoint";
import { ProductCard } from "./ProductCard";
import { Darkmode } from "components/styles/Darkmode";
import { Grid } from "../../components/atoms/Grid";
import { Product, ProductConversions, TrolleyItem } from "data/product";
import { IngredientAmount } from "../../data/ingredients";
import { Link } from "react-router-dom";

interface Props {
  ingredient: Ingredient;
  onSearch: () => void;
  pantryItem?: PantryItem;
  selected: boolean;
  productOptions: Product[];
  trolley: TrolleyItem[];
  conversions: ProductConversions;
  onAddToCart: () => void;
}

export function RichIngredientItem({
  ingredient,
  onSearch,
  pantryItem,
  selected,
  productOptions,
  trolley,
  conversions,
  onAddToCart,
}: Props) {
  const product = productOptions[0];

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (selected && event.key === "Enter") {
        if (!productOptions.length) {
          onSearch();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [productOptions, onSearch, selected]);

  const neededQty = (ingredient.qty || 0) - (pantryItem?.ingredient.qty || 0);

  return (
    <Grid
      key={ingredient.type.id}
      css={{
        grid: '"Image Ingredient Product" / auto 1fr auto',
        [Breakpoint.LAPTOP]: {
          grid: `[a] "Image Ingredient" [b] "Image Product" / auto 1fr`,
        },
        [Breakpoint.TABLET]: {
          grid: `[a] "Image Ingredient" [b] "Product Product" / auto 1fr`,
        },
        borderBottom: selected ? "1px solid #55050b" : "1px solid #dedede",
        background: selected ? "white" : "inherit",
        [Darkmode]: {
          background: selected ? "black" : "inherit",
          borderBottom: selected ? "1px solid orange" : "1px solid #333",
        },
        ":hover": {
          background: "#dedede",
          [Darkmode]: {
            background: "#333",
          },
          "& img": {
            opacity: 1,
          },
        },
      }}
      onClick={() => onSearch()}
    >
      {ingredient.type.imageUrl ? (
        <img
          src={ingredient.type.imageUrl}
          css={{
            gridArea: "Image",
            height: 128,
            width: 128,
            clipPath: "inset(0% 0% 33% 33%)",
            opacity: 0.8,
            transform: "translate(-33%,33%)",
            marginTop: "auto",
            [Breakpoint.TABLET]: {
              clipPath: "none",
              transform: "none",
              height: 48,
              width: 48,
              margin: "auto 16px",
            },
          }}
          alt={ingredient.type.name}
          onError={(e) => (e.currentTarget.style.display = "none")}
        ></img>
      ) : (
        <PlaceholderImage />
      )}
      <Stack css={{ gridArea: "Ingredient" }}>
        <Flex>
          <span
            css={{
              fontWeight: "normal",
              fontSize: 24,
              paddingTop: 8,
            }}
          >
            <span css={{ color: "grey" }}>
              {pantryItem && pantryItem.ingredient.qty ? (
                <>
                  <IngredientAmount ingredient={pantryItem.ingredient} /> /{" "}
                </>
              ) : null}
              <IngredientAmount ingredient={ingredient} />{" "}
            </span>
            <span css={{ textTransform: "capitalize" }}>
              {ingredient.type.name}
            </span>
          </span>
        </Flex>
        <Stack css={{ fontSize: 12 }}>
          Used In
          <table css={{ color: "grey", width: "fit-content" }}>
            {ingredient.usedIn?.map((recipe: Recipe) => {
              const needed = recipe.ingredients.find(
                (i) => i.type.name === ingredient.type.name
              );
              return (
                <tr key={recipe.slug}>
                  <td css={{ paddingRight: 8, minWidth: 32 }}>
                    {needed ? <IngredientAmount ingredient={needed} /> : null}
                  </td>
                  <td css={{ fontStyle: "italic" }}>
                    <Link
                      to={`/recipes/${recipe.slug}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {recipe.name}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </table>
        </Stack>
      </Stack>
      <Stack
        css={{
          marginTop: "auto",
          marginBottom: "auto",
          marginRight: 8,
          [Breakpoint.LAPTOP]: {
            margin: "16px",
          },
          [Breakpoint.TABLET]: {
            margin: "16px auto",
          },
          gridArea: "Product",
        }}
      >
        {product ? (
          <ProductCard
            product={product}
            ingredient={{ ...ingredient, qty: neededQty }}
            trolley={trolley}
            selected={selected}
            conversions={conversions}
            onAddToCart={onAddToCart}
          />
        ) : null}
      </Stack>
    </Grid>
  );
}
