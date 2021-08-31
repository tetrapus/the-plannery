import React, { useContext, useEffect, useState } from "react";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { RichIngredientItem } from "./RichIngredientItem";
import { PantryContext, PantryItem } from "data/pantry";
import { useHouseholdCollection } from "../../data/auth-state";
import { ShoppingWizard } from "./ShoppingWizard";
import { Price } from "components/atoms/Price";
import { Darkmode } from "components/styles/Darkmode";
import { Breakpoint } from "components/styles/Breakpoint";
import { TextButton } from "../../components/atoms/TextButton";
interface Props {
  ingredients: Ingredient[];
}

interface PantryIngredient {
  ingredient: Ingredient;
  pantryItem?: PantryItem;
  complete: boolean;
  unlimited: boolean;
}

export function ShoppingListTemplate({ ingredients }: Props) {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>();
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [trolley, setTrolley] = useState<any[]>([]);

  useEffect(() => {
    if (!(document as any).woolies) {
      return;
    }
    (document as any).woolies.getCart().then((trolley: any) => {
      setTrolley(trolley.AvailableItems);
      console.log(trolley);
    });
  }, []);

  const pantry = useContext(PantryContext);

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
      return { ingredient, pantryItem, complete, unlimited };
    }
  );

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

  const preferredProducts =
    useHouseholdCollection(
      (household) => household.collection("productPreferences"),
      (snapshot) =>
        Object.fromEntries(
          snapshot.docs.map((doc) => [
            doc.id,
            {
              ref: doc.ref,
              id: doc.id,
              options: doc.data(),
            },
          ])
        )
    ) || {};

  const productConversions =
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
                  zIndex: 1,
                  [Darkmode]: {
                    background: "black",
                  },
                }}
              >
                <h1 css={{ marginLeft: 128 }}>{title}</h1>
                {sectionPrice ? (
                  <h2 css={{ margin: "auto 16px auto auto" }}>
                    <Price amount={sectionPrice} />
                  </h2>
                ) : null}
              </Flex>
              <Stack>
                {ingredients.map(({ ingredient, pantryItem }) => {
                  return (
                    <div data-id={ingredient.type.id}>
                      <RichIngredientItem
                        key={ingredient.type.id}
                        ingredient={ingredient}
                        pantryItem={pantryItem}
                        trolley={trolley}
                        conversions={productConversions}
                        selected={
                          selectedIngredient?.type.name === ingredient.type.name
                        }
                        onSearch={() => {
                          setSelectedIngredient(ingredient);
                          setShowWizard(true);
                        }}
                        onAddToCart={() => {
                          (document as any).woolies
                            .getCart()
                            .then((trolley: any) => {
                              setTrolley(trolley.AvailableItems);
                            });
                        }}
                        productOptions={Object.values(
                          preferredProducts[ingredient.type.name]?.options || {}
                        )}
                      />
                    </div>
                  );
                })}
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
