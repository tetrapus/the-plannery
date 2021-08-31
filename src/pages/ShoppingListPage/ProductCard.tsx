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
  ProductConversions,
  TrolleyItem,
} from "data/product";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { useState } from "react";

interface Props {
  product: Product;
  ingredient: Ingredient;
  trolley: TrolleyItem[];
  selected: boolean;
  conversions: ProductConversions;
  onAddToCart(): void;
}

export function ProductCard({
  product,
  ingredient,
  trolley,
  selected,
  conversions,
  onAddToCart,
}: Props) {
  const [quantity, setQuantity] = useState<number | undefined>();
  const [ratio, setRatio] = useState<number | undefined>();

  useEffect(() => {
    const normalisedIngredient = normaliseIngredient(ingredient);
    const normalisedProduct = normaliseProduct(product, ingredient);
    const orderStep = product.Unit === "Each" ? 1 : 100;
    const getDefaultQty = (value?: number) =>
      Math.min(
        Math.max(
          Math.ceil((value || 0) * orderStep) / orderStep,
          product.MinimumQuantity
        ),
        product.SupplyLimit
      );
    let ratio =
      conversions[product.Stockcode]?.conversions[
        normalisedIngredient?.unit || "unit"
      ];
    const sameUnit = isConvertible(normalisedProduct, normalisedIngredient);
    if (!ratio && sameUnit) {
      ratio = normalisedProduct?.qty || 1;
    }

    const estimatedAmount = ratio
      ? (normalisedIngredient?.qty || 0) / ratio
      : ["ml", "g"].includes(normalisedIngredient?.unit || "")
      ? 1
      : normalisedIngredient?.qty || 1;

    const requiredAmount = getDefaultQty(estimatedAmount);

    if (requiredAmount) {
      setQuantity(requiredAmount);
    }
    setRatio(ratio);
  }, [ingredient, product, conversions]);

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
        css={{ flexGrow: 1, padding: 8 }}
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
          <div css={{ marginBottom: 8 }}>
            {product.Name} {product.PackageSize}
          </div>
          <div css={{ fontSize: 12 }}>
            <Price amount={product.Price * (quantity || 1)} />
            <span css={{ color: "grey", marginLeft: 4 }}>
              {product.CupString}
            </span>
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
            setQuantity(e.target.value ? parseInt(e.target.value) : 0)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              input.current?.blur();
            }
          }}
        />
        {ratio && quantity ? (
          <div
            css={{
              background: "#dedede",
              textAlign: "center",
              fontSize: 14,
              padding: 4,
              [Darkmode]: {
                background: "#333",
              },
            }}
          >
            ≈ {ratio * quantity} {displayUnit(ingredient?.unit)}
          </div>
        ) : null}
      </Stack>
    </Card>
  );
}
