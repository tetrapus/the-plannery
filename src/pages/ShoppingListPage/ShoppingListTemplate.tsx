import React, { useContext, useEffect, useState } from "react";
import Ingredient, { isSameIngredient } from "../../data/ingredients";
import { Stack } from "../../components/atoms/Stack";
import { Flex } from "../../components/atoms/Flex";
import { RichIngredientItem } from "./RichIngredientItem";
import { inPantry, PantryContext, PantryItem } from "data/pantry";
import {
  useHouseholdCollection,
  useHouseholdDocument,
} from "../../data/auth-state";
import { ShoppingWizard } from "./ShoppingWizard";
import { Price } from "components/atoms/Price";
import { Darkmode } from "components/styles/Darkmode";
import { Breakpoint } from "components/styles/Breakpoint";
import {
  convertIngredientToProduct,
  Product,
  ProductConversions,
} from "data/product";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import trolleyIcon from "animations/trolley.json";
import { ExternalLink } from "../../components/atoms/ExternalLink";
import { getIngredientsForMealPlan, MealPlan } from "data/meal-plan";
import { Recipe } from "data/recipes";
import { Card } from "components/atoms/Card";
import { AuthStateContext } from "data/auth-state";
import { useFirestoreDoc } from "init/firebase";
import { WoolworthsAccount } from "data/woolworths";

interface Props {
  recipes: Recipe[];
  mealPlan: MealPlan;
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

interface OrderEntry {
  OrderId: number;
  CreatedDate: string;
  OriginalOrderCreatedDate: string;
  Total: number;
  CurrentStatus: string;
  DeliveryMethod: string;
  ProjectedDeliveryTime: {
    Status: string;
    OriginalStartTime: string;
    OriginalEndTime: string;
    StartTime: string;
    EndTime: string;
    BufferType: string;
  };
  IsPfdOrder: boolean;
  OrderType: string;
  MarketOrders: never[];
  IsMarketOnly: boolean;
  IsPostPickPayOrder: boolean;
  IsThirdPartyDelivery: boolean;
}

interface OrderedProduct {
  StockCode: number;
  Brand: string;
  Name: string;
  Variety: string;
  Size: string;
  Quantity: number;
  Total: number;
  TotalExcludingGst: number;
  ListPrice: { Measure: string; Value: number };
  SalePrice: { Measure: string; Value: number };
  ComparativePrice: { Measure: string; Value: number };
  AllowSubstitution: boolean;
  LineNumber: number;
  IsPurchasableWithRewardsCredits: boolean;
  IsNew: boolean;
  IsGiftable: boolean;
  IsNotSelfServiceReturnable: boolean;
}

export function ShoppingListTemplate({ recipes, mealPlan }: Props) {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>();
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [trolley, setTrolley] = useState<any[]>([]);
  const { household, insertMeta } = useContext(AuthStateContext);

  const [selectedMeals] = useState<{
    [slug: string]: number;
  }>(Object.fromEntries(mealPlan.recipes.map((recipe) => [recipe.slug, 1])));

  const ingredients = getIngredientsForMealPlan(recipes, {
    recipes: mealPlan.recipes
      .map((recipe) =>
        Array.from(Array(selectedMeals[recipe.slug] || 1).keys()).map(
          (_) => recipe
        )
      )
      .flat(1),
  });

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
              options: doc.data() as { [stockcode: number]: Product },
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
            { id: id, options: data as { [stockcode: number]: Product } },
          ])
        )
    ) || {};

  const preferredProducts: {
    [key: string]: { id: string; options: { [stockcode: number]: Product } };
  } = {
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

  const productConversions: ProductConversions = {
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

      const requiredQty = ingredient.qty
        ? pantryItem
          ? pantryItem.ingredient.qty
            ? Math.max(ingredient.qty - pantryItem.ingredient.qty, 0)
            : 0
          : ingredient.qty || 0
        : 0;

      let requiredAmount, ratio;
      if (ingredient && preferredProduct && productConversions) {
        ({ requiredAmount, ratio } = convertIngredientToProduct(
          { ...ingredient, qty: requiredQty },
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

  const [orders, setOrders] = useState<OrderEntry[]>([]);

  const processedOrders =
    useFirestoreDoc(
      household,
      (household) => household.ref.collection("blobs").doc("processedOrders"),
      (snapshot) => Object.keys(snapshot.data()?.woolworths)
    ) || [];

  const [wooliesAccount, setWooliesAccount] = useState<
    WoolworthsAccount | undefined
  >();

  const bootstrap = async () => {
    if ((document as any).woolies) {
      const woolies = (document as any).woolies;
      const me = await woolies.bootstrap();
      setWooliesAccount(me);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    (async () => {
      if ((document as any).woolies) {
        const woolies = (document as any).woolies;

        if (wooliesAccount?.ShopperDetailsRequest) {
          const orders = await woolies.getOrders(
            wooliesAccount.ShopperDetailsRequest.Id
          );
          setOrders(orders.items);
        }
      }
    })();
  }, [wooliesAccount]);

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
        {/*
        <TextButton
          onClick={() => {
            console.log(preferredProductsDocument);
            const newThing = Object.fromEntries(
              Object.entries(preferredProductsDocument).map(([name, value]) => [
                name,
                Object.fromEntries(
                  Object.entries(value.options).map(([stockcode, product]) => [
                    stockcode,
                    trimProduct(product),
                  ])
                ),
              ])
            );
            household?.ref
              .collection("blobs")
              .doc("productPreferences")
              .set(newThing);
          }}
        >
          Compact Collection
        </TextButton>
        */}

        {/* TODO
        <Stack>
          {mealPlan.recipes.map((planItem) => {
            const recipe = recipes.find(
              (recipe) => recipe.slug === planItem.slug
            );
            return (
              <Flex
                onClick={() =>
                  setSelectedMeals({
                    ...selectedMeals,
                    [planItem.slug]: selectedMeals[planItem.slug] + 1,
                  })
                }
              >
                {recipe?.name}{" "}
                {(recipe?.serves || 0) * selectedMeals[planItem.slug]}
              </Flex>
            );
          })}
        </Stack>
        */}
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
                      <div
                        data-id={ingredient.type.id}
                        key={ingredient.type.id}
                      >
                        <RichIngredientItem
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
              <ExternalLink
                css={{ margin: "8px auto" }}
                href="https://woolworths.com.au/checkout"
              >
                View Cart
              </ExternalLink>
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
        {orders
          .slice(0, 3)
          .filter(
            (order) => !processedOrders.includes(order.OrderId.toString())
          )
          .map((order) => (
            <Card css={{ margin: 8, maxWidth: 400 }}>
              <Flex>
                <Flex css={{ padding: 8, flexGrow: 1 }}>
                  <Stack>
                    <ExternalLink
                      href={`https://www.woolworths.com.au/shop/myaccount/myorders/${order.OrderId}`}
                      css={{ flexGrow: 1 }}
                    >
                      <h3 css={{ margin: 0 }}>Order #{order.OrderId}</h3>
                    </ExternalLink>
                    <div>{new Date(order.CreatedDate).toDateString()} </div>
                  </Stack>
                  <Flex
                    css={{
                      alignSelf: "center",
                      marginLeft: "auto",
                      padding: 8,
                    }}
                  >
                    <h3 css={{ margin: 0 }}>
                      <Price amount={order.Total} />
                    </h3>
                  </Flex>
                </Flex>
                <Stack>
                  <Flex
                    css={{
                      background: "darkgreen",
                      color: "white",
                      fontWeight: "bold",
                      padding: 8,
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      if ((document as any).woolies) {
                        const woolies = (document as any).woolies;
                        const orderData = await woolies.getOrder(order.OrderId);
                        const products: OrderedProduct[] =
                          orderData.OrderProducts.map(
                            (product: any) => product.Ordered
                          );
                        const mealPlanIngredients = Object.fromEntries(
                          getIngredientsForMealPlan(recipes, mealPlan).map(
                            (ingredient) => [ingredient.type.name, ingredient]
                          )
                        );
                        const newIngredients = products
                          .map((product) => ({
                            product,
                            preferred: Object.values(preferredProducts)
                              .filter(
                                ({ id, options }) =>
                                  mealPlanIngredients[id] &&
                                  options[product.StockCode] !== undefined
                              )
                              .map(({ id }) => mealPlanIngredients[id])[0],
                          }))
                          .filter(({ preferred }) => preferred)
                          .map(({ product, preferred }) => ({
                            product,
                            preferred,
                            conversion: convertIngredientToProduct(
                              preferred,
                              {
                                Unit: product.ListPrice.Measure,
                                MinimumQuantity: 0,
                                Stockcode: product.StockCode,
                                SupplyLimit: 1000000,
                              },
                              productConversions
                            ),
                          }))
                          .filter(({ conversion }) => conversion.ratio)
                          .map(({ product, preferred, conversion }) => ({
                            ingredient: {
                              ...preferred,
                              qty: product.Quantity * conversion.ratio,
                            },
                            pantryItem: inPantry(preferred, pantry),
                          }))
                          .map(({ ingredient, pantryItem }) => ({
                            ...ingredient,
                            qty:
                              ingredient.qty +
                              ((pantryItem && pantryItem.ingredient.qty) || 0),
                          }));
                        const newBlob: {
                          [key: string]: { [unit: string]: PantryItem };
                        } = {};
                        newIngredients.forEach((ingredient) => {
                          if (!newBlob[ingredient.type.id]) {
                            newBlob[ingredient.type.id] = {};
                          }
                          newBlob[ingredient.type.id][
                            JSON.stringify(ingredient.unit)
                          ] = { ingredient, ...insertMeta };
                        });
                        household?.ref
                          .collection("blobs")
                          .doc("pantry")
                          .set(newBlob, { merge: true });
                        household?.ref
                          .collection("blobs")
                          .doc("processedOrders")
                          .set(
                            { woolworths: { [order.OrderId]: insertMeta } },
                            { merge: true }
                          );
                      }
                    }}
                  >
                    Add to Pantry
                  </Flex>
                  <Flex
                    css={{
                      background: "#eee",
                      padding: 8,
                      cursor: "pointer",
                      justifyContent: "center",
                      color: "#222",
                    }}
                    onClick={() => {
                      household?.ref
                        .collection("blobs")
                        .doc("processedOrders")
                        .set(
                          { woolworths: { [order.OrderId]: insertMeta } },
                          { merge: true }
                        );
                    }}
                  >
                    Skip
                  </Flex>
                </Stack>
              </Flex>
            </Card>
          ))}
        <ShoppingWizard
          selectedIngredient={selectedIngredient}
          woolworthsAccount={wooliesAccount}
          onSelection={() => setShowWizard(false)}
          onLogin={() => bootstrap()}
        />
      </Stack>
    </Flex>
  );
}
