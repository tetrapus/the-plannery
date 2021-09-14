import React, { useContext, useEffect, useState } from "react";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { RichIngredientItem } from "./RichIngredientItem";
import { PantryContext, PantryItem } from "data/pantry";
import {
  useHouseholdCollection,
  useHouseholdDocument,
} from "../../data/auth-state";
import { ShoppingWizard } from "./ShoppingWizard";
import { Price } from "components/atoms/Price";
import { Darkmode } from "components/styles/Darkmode";
import { Breakpoint } from "components/styles/Breakpoint";
import { TextButton } from "../../components/atoms/TextButton";
import { convertIngredientToProduct, Product } from "data/product";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import trolleyIcon from "animations/trolley.json";

interface Props {
  ingredients: Ingredient[];
}

interface PantryIngredient {
  ingredient: Ingredient;
  pantryItem?: PantryItem;
  complete: boolean;
  unlimited: boolean;
  preferredProduct?: Product;
  requiredAmount?: number;
  ratio?: number;
}

export function ShoppingListTemplate({ ingredients }: Props) {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>();
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [trolley, setTrolley] = useState<any[]>([]);

  const preferredProductsCollection =
    useHouseholdCollection(
      (household) => household.collection("productPreferences"),
      (snapshot) =>
        Object.fromEntries(
          snapshot.docs.map((doc) => [
            doc.id,
            {
              ref: doc.ref,
              id: doc.id,
              options: doc.data() as Product,
            },
          ])
        )
    ) || {};

  const preferredProductsDocument =
    useHouseholdDocument(
      (household) => household.collection("blobs").doc("productPreferences"),
      (snapshot) =>
        Object.fromEntries(
          Object.entries(snapshot.data() || {}).map(([id, data]) => [
            id,
            { id: id, options: data as Product },
          ])
        )
    ) || {};

  const preferredProducts: { [key: string]: { id: string; options: Product } } =
    {
      ...preferredProductsCollection,
      ...preferredProductsDocument,
    };

  const productConversionsCollection =
    useHouseholdCollection(
      (household) => household.collection("productConversions"),
      (snapshot) =>
        Object.fromEntries(
          snapshot.docs.map((doc) => [
            doc.id,
            {
              ref: doc.ref,
              id: doc.id,
              conversions: doc.data(),
            },
          ])
        )
    ) || {};

  const productConversionsBlob =
    useHouseholdDocument(
      (household) => household.collection("blobs").doc("productConversions"),
      (snapshot) =>
        Object.fromEntries(
          Object.entries(snapshot.data() || {}).map(([id, data]) => [
            id,
            { id: id, conversions: data },
          ])
        )
    ) || {};

  const productConversions = {
    ...productConversionsCollection,
    ...productConversionsBlob,
  };
  const pantry = useContext(PantryContext);

  useEffect(() => {
    if (!(document as any).woolies) {
      return;
    }
    (document as any).woolies.getCart().then((trolley: any) => {
      setTrolley(trolley.AvailableItems);
      console.log(trolley);
    });
  }, []);

  const pantryIngredients: PantryIngredient[] = ingredients.map(
    (ingredient) => {
      const pantryItem = pantry?.items.find((item) =>
        isSameIngredient(item.ingredient, ingredient)
      );

      const complete = !!(
        pantryItem &&
        (!pantryItem.ingredient.qty ||
          (ingredient.qty && pantryItem.ingredient.qty >= ingredient.qty))
      );

      const unlimited = !!(
        pantryItem &&
        !pantryItem.ingredient.qty &&
        !pantryItem.ingredient.unit
      );

      const preferredProduct = Object.values(
        preferredProducts[ingredient.type.name]?.options || {}
      )[0];

      let requiredAmount, ratio;
      if (ingredient && preferredProduct && productConversions) {
        ({ requiredAmount, ratio } = convertIngredientToProduct(
          ingredient,
          preferredProduct,
          productConversions
        ));
      }
      return {
        ingredient,
        pantryItem,
        complete,
        unlimited,
        preferredProduct,
        requiredAmount,
        ratio,
      };
    }
  );

  const addProductsToTrolley = async (
    selections: { product: Product; quantity: number }[]
  ) => {
    for (let i = 0; i < selections.length; i++) {
      const { product, quantity } = selections[i];
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
    }
    const wooliesTrolley = await (document as any).woolies.getCart();
    setTrolley(wooliesTrolley.AvailableItems);
  };

  const filters = {
    "Shopping List": ({ complete }: PantryIngredient) => !complete,
    Stocked: ({ complete, unlimited }: PantryIngredient) =>
      complete && !unlimited,
    "Pantry Staples": ({ unlimited }: PantryIngredient) => unlimited,
  };

  const ingredientLists: [string, PantryIngredient[]][] = Object.entries(
    filters
  ).map(([title, filter]) => [title, pantryIngredients.filter(filter)]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (document.activeElement === document.body) {
        const directions: { [key: string]: number } = {
          ArrowDown: 1,
          ArrowUp: -1,
        };
        if (directions[event.key]) {
          const ingredients = ingredientLists
            .map(([, ingredients]) => ingredients)
            .flat(1);
          let nextIngredient;
          if (selectedIngredient) {
            const index = ingredients.findIndex((ingredient) =>
              isSameIngredient(ingredient.ingredient, selectedIngredient)
            );
            nextIngredient =
              ingredients[index + directions[event.key]]?.ingredient;
          } else {
            nextIngredient = ingredients[0]?.ingredient;
          }
          setSelectedIngredient(nextIngredient);
          document
            .querySelector(`[data-id="${nextIngredient.type.id}"]`)
            ?.scrollIntoView({
              block: "end",
              inline: "nearest",
              behavior: "smooth",
            });
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [ingredientLists, selectedIngredient]);

  return (
    <Flex>
      <Stack
        css={{
          flexGrow: 1,
          [Breakpoint.MOBILE]: {
            display: showWizard ? "none" : "inherit",
          },
        }}
      >
        {ingredientLists.map(([title, ingredients]) => {
          if (!ingredients.length) return null;
          const sectionPrice = Object.entries(preferredProducts)
            .filter(([key, value]) =>
              ingredients.find(
                (ingredient) => key === ingredient.ingredient.type.name
              )
            )
            .map(([key, value]) => Object.values(value.options))
            .flat(1)
            .map((product) =>
              trolley.map((item) =>
                item.Stockcode === product.Stockcode ? item.SalePrice : 0
              )
            )
            .flat(1)
            .reduce((a: number, b: number) => a + b, 0);
          return (
            <Stack css={{ marginBottom: 32 }} key={title}>
              <Flex
                css={{
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  borderBottom: "1px solid black",
                  alignItems: "center",
                  zIndex: 1,
                  [Darkmode]: {
                    background: "black",
                    borderBottom: "1px solid white",
                  },
                }}
              >
                <h1 css={{ marginLeft: 128, marginRight: "auto" }}>{title}</h1>
                {sectionPrice ? (
                  <h2 css={{ margin: "auto 16px" }}>
                    <Price amount={sectionPrice} />
                  </h2>
                ) : null}
                <AnimatedIconButton
                  animation={trolleyIcon}
                  css={{ margin: "0 16px" }}
                  onClick={async () => {
                    await addProductsToTrolley(
                      ingredients
                        .filter(
                          (ingredient) =>
                            ingredient.ratio &&
                            ingredient.preferredProduct &&
                            ingredient.requiredAmount
                        )
                        .map((ingredient) => ({
                          product: ingredient.preferredProduct as Product,
                          quantity: ingredient.requiredAmount as number,
                        }))
                    );
                  }}
                >
                  Auto-fill Cart
                </AnimatedIconButton>
              </Flex>
              <Stack>
                {ingredients.map(
                  ({
                    ingredient,
                    pantryItem,
                    preferredProduct,
                    requiredAmount,
                    ratio,
                  }) => {
                    return (
                      <div data-id={ingredient.type.id}>
                        <RichIngredientItem
                          key={ingredient.type.id}
                          ingredient={ingredient}
                          pantryItem={pantryItem}
                          trolley={trolley}
                          conversions={productConversions}
                          selected={
                            selectedIngredient?.type.name ===
                            ingredient.type.name
                          }
                          requiredAmount={requiredAmount}
                          ratio={ratio}
                          onSearch={() => {
                            setSelectedIngredient(ingredient);
                            setShowWizard(true);
                          }}
                          onAddToCart={async (quantity) => {
                            if (!preferredProduct) return;
                            await addProductsToTrolley([
                              { product: preferredProduct, quantity },
                            ]);
                          }}
                          product={preferredProduct}
                        />
                      </div>
                    );
                  }
                )}
              </Stack>
              <TextButton
                css={{ margin: "8px auto" }}
                onClick={() => {
                  (window.location as any) = "https://woolworths.com.au/";
                }}
              >
                View Cart
              </TextButton>
            </Stack>
          );
        })}
      </Stack>
      <Stack
        css={{
          [Breakpoint.MOBILE]: {
            display: showWizard ? "inherit" : "none",
            width: "100%",
          },
        }}
      >
        <ShoppingWizard
          selectedIngredient={selectedIngredient}
          onSelection={() => setShowWizard(false)}
        />
      </Stack>
    </Flex>
  );
}
