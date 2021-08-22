import React, { useContext, useEffect, useState } from "react";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { Button } from "components/atoms/Button";
import { RichIngredientItem } from "./RichIngredientItem";
import { PantryContext, PantryItem } from "data/pantry";
import { useHouseholdCollection } from "../../data/auth-state";
import { ShoppingWizard } from "./ShoppingWizard";
import { Price } from "components/atoms/Price";
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
      const pantryItem = pantry?.items.find(
        (item) => isSameIngredient(item.ingredient, ingredient) //item.ingredient.type.name === ingredient.type.name
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

  return (
    <Flex>
      <Stack css={{ flexGrow: 1 }}>
        {Object.entries(filters).map(([title, filter]) => {
          const ingredients = pantryIngredients.filter(filter);
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
                    <>
                      <RichIngredientItem
                        key={ingredient.type.id}
                        ingredient={ingredient}
                        pantryItem={pantryItem}
                        trolley={trolley}
                        selected={
                          selectedIngredient?.type.name === ingredient.type.name
                        }
                        onSearch={() => {
                          setSelectedIngredient(ingredient);
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
                    </>
                  );
                })}
              </Stack>
              <Button
                css={{ margin: "8px auto" }}
                onClick={() => {
                  (window.location as any) = "https://woolworths.com.au/";
                }}
              >
                View Cart
              </Button>
            </Stack>
          );
        })}
      </Stack>
      <ShoppingWizard selectedIngredient={selectedIngredient} />
    </Flex>
  );
}
