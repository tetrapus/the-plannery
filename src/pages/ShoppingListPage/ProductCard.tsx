import { Card } from "components/atoms/Card";
import { Flex } from "components/atoms/Flex";
import { Price } from "components/atoms/Price";
import { Stack } from "components/atoms/Stack";
import { QuantityInput } from "components/molecules/QuantityInput";
import { Darkmode } from "components/styles/Darkmode";
import Ingredient, { displayUnit, normaliseIngredient } from "data/ingredients";
import {
  isConvertible,
  normaliseProduct,
  Product,
  TrolleyItem,
} from "data/product";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { useState } from "react";

interface Props {
  product: Product;
  ingredient: Ingredient;
  trolley: TrolleyItem[];
  selected: boolean;
  onAddToCart(): void;
}

export function ProductCard({
  product,
  ingredient,
  trolley,
  selected,
  onAddToCart,
}: Props) {
  const [quantity, setQuantity] = useState<number | undefined>();
  const normalisedIngredient = normaliseIngredient(ingredient);
  const orderStep = product.Unit === "Each" ? 1 : 100;
  const getDefaultQty = (value?: number) =>
    Math.min(
      Math.max(
        Math.ceil((value || 0) * orderStep) / orderStep,
        product.MinimumQuantity
      ),
      product.SupplyLimit
    );
  const normalisedProduct = normaliseProduct(product, ingredient);
  const convertable = isConvertible(normalisedProduct, normalisedIngredient);
  const estimatedAmount = convertable
    ? (normalisedIngredient?.qty || 0) / (normalisedProduct?.qty || 1)
    : ["ml", "g"].includes(normalisedIngredient?.unit || "")
    ? 1
    : normalisedIngredient?.qty || 1;
  const requiredAmount = getDefaultQty(estimatedAmount);

  if (quantity === undefined && requiredAmount) {
    setQuantity(requiredAmount);
  }

  const trolleyItem = trolley.find(
    (item) => item.Stockcode === product.Stockcode
  );

  const cartCallback = useCallback(async () => {
    if (quantity === undefined) return;
    const trolleyItem = trolley.find(
      (item) => item.Stockcode === product.Stockcode
    );
    if (!trolleyItem) {
      await (document as any).woolies.addToCart(product.Stockcode, quantity);
    } else if (trolleyItem.QuantityInTrolley < quantity) {
      await (document as any).woolies.updateCart(product.Stockcode, quantity);
    } else {
      await (document as any).woolies.removeFromCart(product.Stockcode);
    }
    onAddToCart();
  }, [onAddToCart, product, quantity, trolley]);

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (selected && document.activeElement === document.body) {
        if (event.key === "Enter") {
          cartCallback();
        } else if (event.key.match(/[0-9]/)) {
          setQuantity(parseInt(event.key));
          event.preventDefault();
          input.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [selected, cartCallback]);

  return (
    <Card
      key={product.Stockcode}
      css={{
        display: "flex",
        margin: "4px 8px",
        width: 300,
        border:
          trolleyItem && quantity
            ? trolleyItem.QuantityInTrolley >= quantity
              ? "1px solid green"
              : "1px solid orange"
            : "none",
        background: "white",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Flex
        css={{ flexGrow: 1 }}
        onClick={() => {
          if (quantity === undefined) return;
          onAddToCart();
        }}
      >
        <img
          src={product.SmallImageFile}
          css={{ height: 64, margin: 4, borderRadius: 3 }}
          alt=""
        />

        <Stack
          css={{
            marginLeft: 4,
            marginTop: 8,
            marginRight: 4,
          }}
        >
          <div>
            {product.Name} {product.PackageSize}
          </div>
          <div css={{ fontSize: 12 }}>
            <Price amount={product.Price} />
            <span css={{ color: "grey" }}>{product.CupString}</span>
          </div>
        </Stack>
      </Flex>
      {/* TODO: Merge into TextInput */}
      <Stack>
        <QuantityInput
          value={quantity || ""}
          inputRef={input}
          css={{
            width: 32,
            flexGrow: 1,
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuantity(e.target.value ? parseInt(e.target.value) : undefined)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              input.current?.blur();
            }
          }}
        />
        {normalisedProduct?.unit !== normalisedIngredient?.unit ? (
          <div
            css={{
              background: "#dedede",
              textAlign: "center",
              fontSize: 14,
              [Darkmode]: {
                background: "#333",
              },
            }}
          >
            ≈{" "}
            {convertable
              ? (ingredient?.qty || 1) *
                ((requiredAmount * (normalisedProduct?.qty || 1)) /
                  (normalisedIngredient?.qty || 1))
              : requiredAmount}{" "}
            {displayUnit(ingredient?.unit)}
          </div>
        ) : null}
      </Stack>
    </Card>
  );
}
