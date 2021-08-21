import { Flex } from "components/atoms/Flex";
import { PlaceholderImage } from "components/atoms/PlaceholderImage";
import { Stack } from "components/atoms/Stack";
import React, { useState } from "react";
import { Recipe } from "data/recipes";
import Ingredient, { displayUnit, normaliseIngredient } from "data/ingredients";
import { PantryItem } from "data/pantry";
import { Card } from "components/atoms/Card";
import { TextInput } from "components/atoms/TextInput";
import { Price } from "components/atoms/Price";

export interface Product {
  TileID: number;
  Stockcode: number;
  Barcode: string;
  GtinFormat: number;
  CupPrice: number;
  InstoreCupPrice: string;
  CupMeasure: string;
  CupString: string;
  InstoreCupString: string;
  HasCupPrice: boolean;
  InstoreHasCupPrice: boolean;
  Price: number;
  InstorePrice: number;
  Name: string;
  DisplayName: null | string;
  UrlFriendlyName: string;
  Description: string;
  SmallImageFile: string;
  MediumImageFile: string;
  LargeImageFile: string;
  IsNew: boolean;
  IsOnSpecial: boolean;
  InstoreIsOnSpecial: boolean;
  IsEdrSpecial: boolean;
  SavingsAmount: number;
  InstoreSavingsAmount: number;
  WasPrice: number;
  InstoreWasPrice: number;
  QuantityInTrolley: number;
  Unit: string;
  MinimumQuantity: number;
  HasBeenBoughtBefore: boolean;
  IsInTrolley: boolean;
  Source: string;
  SupplyLimit: number;
  MaxSupplyLimitMessage: null | string;
  IsRanged: boolean;
  IsInStock: boolean;
  PackageSize: string;
  IsPmDelivery: boolean;
  IsForCollection: boolean;
  IsForDelivery: boolean;
  IsForExpress: boolean;
  ProductRestrictionMessage: null | string;
  ProductWarningMessage: null | string;
  IsCentreTag: boolean;
  HeaderTag: null;
  HasHeaderTag: boolean;
  UnitWeightInGrams: number;
  SupplyLimitMessage: string;
  SmallFormatDescription: string;
  FullDescription: string;
  IsAvailable: boolean;
  InstoreIsAvailable: boolean;
  IsPurchasable: boolean;
  InstoreIsPurchasable: boolean;
  AgeRestricted: boolean;
  DisplayQuantity: number | null;
  RichDescription: string;
  IsDeliveryPass: boolean;
  HideWasSavedPrice: boolean;
  SapCategories: null;
  Brand: string | null;
  IsRestrictedByDeliveryMethod: boolean;
  IsBundle: boolean;
  IsInFamily: boolean;
  UrlOverride: null;
  AdditionalAttributes: { [key: string]: any };
  DetailsImagePaths: string[];
  Variety: null;
  Rating: {
    ReviewCount: number;
    RatingCount: number;
    RatingSum: number;
    OneStarCount: number;
    TwoStarCount: number;
    ThreeStarCount: number;
    FourStarCount: number;
    FiveStarCount: number;
    Average: number;
    OneStarPercentage: number;
    TwoStarPercentage: number;
    ThreeStarPercentage: number;
    FourStarPercentage: number;
    FiveStarPercentage: number;
  };
  HasProductSubs: boolean;
  IsSponsoredAd: boolean;
  AdID: null;
  AdIndex: null;
  IsMarketProduct: boolean;
  ThirdPartyProductInfo: null;
  MarketFeatures: null;
  MarketSpecifications: null;
}

type TrolleyItem = Product & {
  Quantity: number;
  ListPrice: number;
  SalePrice: number;
  UnitSalePrice: number;
  Updated: string;
  MatchedPromotions: any[];
  MissedPromotions: any[];
  IsRestricted: boolean;
  Discount: number;
  DeferredDiscount: number;
  IsFrozen: boolean;
  IsBundleProduct: boolean;
  BundleProductQuantity: number;
};

interface Props {
  ingredient: Ingredient;
  onSearch: () => void;
  pantryItem?: PantryItem;
  selected: boolean;
  productOptions: Product[];
  trolley: TrolleyItem[];
  onAddToCart: () => void;
}

export function RichIngredientItem({
  ingredient,
  onSearch,
  pantryItem,
  selected,
  productOptions,
  trolley,
  onAddToCart,
}: Props) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  return (
    <Flex
      key={ingredient.type.id}
      css={{
        borderBottom: selected ? "1px solid #55050b" : "1px solid #dedede",
        background: selected ? "white" : "inherit",
        ":hover": {
          background: "white",
        },
      }}
      onClick={() => onSearch()}
    >
      {ingredient.type.imageUrl ? (
        <img
          src={ingredient.type.imageUrl}
          css={{
            height: 128,
            width: 128,
            clipPath: "inset(0% 0% 33% 33%)",
            opacity: 0.8,
            transform: "translate(-33%,33%)",
            marginTop: "auto",
          }}
          alt={ingredient.type.name}
        ></img>
      ) : (
        <PlaceholderImage />
      )}
      <Stack>
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
                  {pantryItem.ingredient.qty || ""}{" "}
                  {displayUnit(pantryItem.ingredient?.unit)} /{" "}
                </>
              ) : null}
              {ingredient.qty || ""} {displayUnit(ingredient?.unit)}{" "}
            </span>
            <span css={{ textTransform: "capitalize" }}>
              {ingredient.type.name}
            </span>
          </span>
        </Flex>
        <Stack css={{ fontSize: 12 }}>
          Used In
          <table css={{ color: "grey" }}>
            {ingredient.usedIn?.map((recipe: Recipe) => {
              const needed = recipe.ingredients.find(
                (i) => i.type.name === ingredient.type.name
              );
              return (
                <tr key={recipe.slug}>
                  <td css={{ paddingRight: 4 }}>
                    {needed?.qty} {needed?.unit}
                  </td>
                  <td css={{ fontStyle: "italic" }}>{recipe.name}</td>
                </tr>
              );
            })}
          </table>
        </Stack>
      </Stack>
      <Stack
        css={{
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          marginRight: 8,
        }}
      >
        {productOptions.map((product) => {
          const [qty, unit] =
            product.Unit === "Each"
              ? product.PackageSize.match(/^(\d+)(.+)$/)?.slice(1, 3) || [
                  "1",
                  "each",
                ]
              : ["1", product.Unit.toLowerCase()];
          const normalisedProduct = normaliseIngredient({
            ...ingredient,
            qty: parseInt(qty),
            unit: unit.toLowerCase(),
          });
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
          const convertable =
            normalisedProduct !== undefined &&
            normalisedIngredient !== undefined &&
            normalisedProduct?.unit === normalisedIngredient?.unit;
          const estimatedAmount = convertable
            ? (normalisedIngredient?.qty || 0) / (normalisedProduct?.qty || 1)
            : ["ml", "g"].includes(normalisedIngredient?.unit || "")
            ? 1
            : normalisedIngredient?.qty || 1;
          const requiredAmount = getDefaultQty(estimatedAmount);

          if (quantities[product.Stockcode] === undefined && requiredAmount) {
            setQuantities({
              ...quantities,
              [product.Stockcode]: requiredAmount,
            });
          }

          const trolleyItem = trolley.find(
            (item) => item.Stockcode === product.Stockcode
          );

          return (
            <Card
              key={product.Stockcode}
              css={{
                display: "flex",
                margin: "4px 8px",
                width: 300,
                border: trolleyItem
                  ? trolleyItem.QuantityInTrolley >=
                    quantities[product.Stockcode]
                    ? "1px solid green"
                    : "1px solid orange"
                  : "none",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex
                css={{ flexGrow: 1 }}
                onClick={async () => {
                  if (!trolleyItem) {
                    await (document as any).woolies.addToCart(
                      product.Stockcode,
                      quantities[product.Stockcode]
                    );
                  } else if (
                    trolleyItem.QuantityInTrolley <
                    quantities[product.Stockcode]
                  ) {
                    await (document as any).woolies.updateCart(
                      product.Stockcode,
                      quantities[product.Stockcode]
                    );
                  } else {
                    await (document as any).woolies.removeFromCart(
                      product.Stockcode
                    );
                  }
                  onAddToCart();
                }}
              >
                <img
                  src={product.SmallImageFile}
                  css={{ height: 64, margin: 4 }}
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
                <Flex
                  css={{
                    borderBottom: "1px solid #dedede",
                    fontSize: 24,
                    background: "#f0f0f0",
                    flexGrow: 1,
                    ":focus-within": { borderBottom: "1px solid #55050b" },
                  }}
                >
                  <TextInput
                    value={quantities[product.Stockcode]}
                    css={{
                      width: 32,
                      flexGrow: 1,
                      textAlign: product.Unit === "Each" ? "center" : "right",
                      height: "auto",
                      borderBottom: "none !important",
                      fontSize: 24,

                      background: "#f0f0f0",
                    }}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [product.Stockcode]: e.target.value,
                      })
                    }
                  ></TextInput>
                  {product.Unit === "Each" ? null : (
                    <Stack
                      css={{
                        justifyContent: "center",
                        textTransform: "lowercase",
                        paddingBottom: 3,
                        color: "grey",
                        paddingRight: 16,
                      }}
                    >
                      {product.Unit}
                    </Stack>
                  )}
                </Flex>
                {normalisedProduct?.unit !== normalisedIngredient?.unit ? (
                  <div
                    css={{
                      background: "#dedede",
                      textAlign: "center",
                      fontSize: 14,
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
        })}
      </Stack>
    </Flex>
  );
}
