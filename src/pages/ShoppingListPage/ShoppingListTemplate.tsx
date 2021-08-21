import React, { useContext, useEffect, useState } from "react";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { Button } from "components/atoms/Button";
import { Product, RichIngredientItem } from "./RichIngredientItem";
import { TextInput } from "components/atoms/TextInput";
import { Spinner } from "components/atoms/Spinner";
import { PantryContext, PantryItem } from "data/pantry";
import { useHouseholdCollection } from "../../data/auth-state";
import { AuthStateContext } from "data/auth-state";
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
  const [searchResults, setSearchResults] = useState<{ Products: Product[] }[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>();
  const [loading, setLoading] = useState(false);
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
  const { household } = useContext(AuthStateContext);

  const runSearch = (value?: string) => {
    setLoading(true);
    (document as any).woolies
      .search(value || searchTerm)
      .then((result: any) => {
        setSearchResults(result.Products);
        setLoading(false);
      });
  };

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
                    ${sectionPrice.toLocaleString()}
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
                          setSearchTerm(ingredient.type.name);
                          runSearch(ingredient.type.name);
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
      <Stack
        css={{
          background: "white",
          width: 400,
          borderRadius: "3px 0px 0px 0px",
          boxShadow: "0 0 4px grey",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        {!selectedIngredient ? (
          (document as any).woolies ? (
            <Stack>
              <h2 css={{ margin: "8px 16px", textAlign: "center" }}>
                Choose an ingredient to start shopping
              </h2>
            </Stack>
          ) : (
            <Stack
              css={{
                margin: "8px 16px",
              }}
            >
              <h2 css={{ textAlign: "center" }}>
                To use the shopping feature, please install the Woolworths
                integration.
              </h2>
              <div>
                1. Download and install{" "}
                <a
                  href="https://www.tampermonkey.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  css={{ fontWeight: "bold", color: "#007fed" }}
                >
                  TamperMonkey
                </a>
              </div>
              <div>
                2. Install the{" "}
                <a
                  href="/woolies.user.js"
                  css={{ fontWeight: "bold", color: "#007fed" }}
                >
                  Plannery x Woolworths Integration Plugin
                </a>
                .
              </div>
              <div>3. Refresh the page.</div>
            </Stack>
          )
        ) : (
          <>
            <h2
              css={{
                textTransform: "capitalize",
                margin: "8px 16px",
                textAlign: "center",
              }}
            >
              {selectedIngredient.type.name}
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <Flex>
                <TextInput
                  value={searchTerm}
                  onChange={(evt) => setSearchTerm(evt.target.value)}
                  css={{ flexGrow: 1 }}
                  placeholder="Search Woolworths"
                ></TextInput>
                <Button
                  onClick={() => runSearch()}
                  css={{ height: "fit-content", margin: 4 }}
                >
                  Search
                </Button>
              </Flex>
            </form>
            <Stack css={{ overflow: "scroll" }}>
              {loading ? (
                <Spinner />
              ) : (
                searchResults
                  .filter((result) => result.Products[0].IsAvailable)
                  .map((result) => (
                    <Flex
                      key={result.Products[0].Stockcode}
                      onClick={() => {
                        if (!selectedIngredient) {
                          return;
                        }
                        household?.ref
                          .collection("productPreferences")
                          .doc(selectedIngredient.type.name)
                          .set({
                            [result.Products[0].Stockcode]: result.Products[0],
                          });
                      }}
                      css={{
                        borderBottom: "1px solid #dedede",
                        ":hover": {
                          background: "#f0f0f0",
                          borderBottom: "1px solid #55050b",
                        },
                      }}
                    >
                      <img
                        src={result.Products[0].SmallImageFile}
                        css={{ height: 64, margin: 4 }}
                        alt=""
                      />

                      <Stack css={{ marginLeft: 4, marginTop: 8 }}>
                        <div>
                          {result.Products[0].Name}{" "}
                          {result.Products[0].PackageSize}
                        </div>
                        <div css={{ fontSize: 12 }}>
                          ${result.Products[0].Price.toFixed(2)}{" "}
                          <span css={{ color: "grey" }}>
                            {result.Products[0].CupString}
                          </span>
                        </div>
                      </Stack>
                    </Flex>
                  ))
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Flex>
  );
}
