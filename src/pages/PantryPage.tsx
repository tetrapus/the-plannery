import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import {
  AuthStateContext,
  useHouseholdCollection,
  useHouseholdDocument,
} from "data/auth-state";
import { MealPlanContext } from "data/meal-plan";
import { Product, trimProduct } from "data/product";
import { Recipe, RecipesCollection, getRecipes } from "data/recipes";
import React, { useContext, useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useSubscription } from "util/use-subscription";
import { playSound } from "../util/play-sound";
import { ProductCard } from "./ShoppingListPage/ProductCard";
import styled, { CSSObject } from "@emotion/styled";
import { useFirestoreDoc } from "init/firebase";
import firebase from "firebase";

function debounce<T>(func: (...args: T[]) => void, timeout = 300) {
  let timer: number;
  return (...args: T[]) => {
    if (!timer || timer < new Date().getTime() - timeout) {
      func(...args);
      timer = new Date().getTime();
    }
  };
}

function range(n: number) {
  return [...[...Array(n)].keys()];
}

const Year = styled.div<{ selected: boolean }>(
  {
    padding: "4px 8px",
    background: "white",
    borderRadius: 2,
    margin: "4px 8px",
  },
  ({ selected }) =>
    selected
      ? {
          background: "black",
          color: "white",
        }
      : {}
);

function Month({
  n,
  selected,
  current,
  onClick,
}: {
  n: number;
  selected: boolean;
  current: boolean;
  onClick: () => void;
}) {
  return (
    <div
      css={{
        padding: "4px 8px",
        borderRadius: 2,
        background: "white",
        border: "1px solid transparent",
        margin: "8px 4px",
        ...((selected
          ? { background: "black", color: "white" }
          : current
          ? { border: "1px solid black" }
          : {}) as CSSObject),
      }}
      onClick={onClick}
    >
      {
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ][n]
      }
    </div>
  );
}

function ProductProperties({
  barcode,
  complete,
  data,
  initialQty,
  initialExpiry,
  onDone,
}: {
  barcode: string;
  complete: boolean;
  data?: Product;
  initialQty?: number;
  initialExpiry?: [] | [number] | [number, number] | [number, number, number];
  onDone(): void;
}) {
  const { household } = useContext(AuthStateContext);
  const [bounds, setBounds] = useState<[number, number | undefined]>([
    1,
    undefined,
  ]);
  const [qty, setQty] = useState<number | undefined>(initialQty || 1);
  const [expiry, setExpiry] = useState<
    [] | [number] | [number, number] | [number, number, number]
  >(initialExpiry || []);

  return (
    <div>
      {complete ? (
        data ? (
          <Stack>
            <Flex>
              <ProductCard
                product={data}
                defaultQuantity={qty}
                onAddToCart={async () => {
                  await household?.ref
                    ?.collection("blobs")
                    .doc("productPantry")
                    .set(
                      {
                        [barcode]: {
                          product: trimProduct(data),
                          qty: qty,
                          expiry: expiry,
                        },
                      },
                      { merge: true }
                    );
                  onDone();
                }}
              >
                {expiry.length ? (
                  <>
                    Use By{" "}
                    {expiry
                      .map((x) =>
                        x.toLocaleString(undefined, {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })
                      )
                      .reverse()
                      .join("/")}{" "}
                  </>
                ) : (
                  <>Shelf-stable</>
                )}
              </ProductCard>
              <Flex css={{ flexGrow: 1, maxWidth: 800 }}>
                {range(5).map((n, idx) => {
                  const getValue = (n: number) =>
                    bounds[1]
                      ? bounds[0] + ((bounds[1] - bounds[0]) * n) / 4
                      : bounds[0] * (n + 1);
                  const value = getValue(n);
                  const Selector = styled(Flex)<{ selected?: boolean }>(
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      background: "white",
                      borderRadius: 24,
                      width: 48,
                      height: 48,
                      fontSize: 16,
                      margin: "auto",
                    },
                    ({ selected }) =>
                      selected ? { color: "white", background: "black" } : {}
                  );
                  const Navigator = styled(Selector)({
                    width: 32,
                    height: 32,
                  });
                  return (
                    <>
                      {bounds[0] && idx === 0 ? (
                        <Navigator
                          onClick={() => {
                            setBounds([0, value]);
                          }}
                        />
                      ) : null}
                      <Selector
                        onClick={() => setQty(value)}
                        selected={qty === value}
                      >
                        {value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </Selector>
                      <Navigator
                        onClick={() => {
                          setBounds([
                            value,
                            n === 4 ? undefined : getValue(n + 1),
                          ]);
                        }}
                      />
                    </>
                  );
                })}
              </Flex>
            </Flex>
            <Stack>
              <Stack>
                <Flex>
                  <Stack>
                    <Year
                      selected={expiry.length === 0}
                      onClick={() => setExpiry([])}
                    >
                      None
                    </Year>
                    {range(3)
                      .map((n: number) => new Date().getFullYear() + n)
                      .map((n) => {
                        return (
                          <Year
                            selected={expiry[0] === n}
                            onClick={() => setExpiry([n])}
                          >
                            {n}
                          </Year>
                        );
                      })}
                  </Stack>
                  <Stack>
                    <Flex>
                      {range(12)
                        .map((n: number) => (new Date().getMonth() + n) % 12)
                        .map((n) => {
                          return (
                            <Stack>
                              <Month
                                n={n}
                                selected={
                                  expiry.length > 1 && expiry[1] === n + 1
                                }
                                current={
                                  expiry[0] === new Date().getFullYear() &&
                                  n === new Date().getMonth()
                                }
                                onClick={() =>
                                  setExpiry([
                                    expiry.length
                                      ? expiry[0]
                                      : new Date().getFullYear(),
                                    n + 1,
                                  ])
                                }
                              />
                              {[
                                new Date().getMonth() + 1,
                                ((new Date().getMonth() + 1) % 12) + 1,
                                expiry[1] === undefined ||
                                expiry[1] === new Date().getMonth() + 1 ||
                                expiry[1] ===
                                  ((new Date().getMonth() + 1) % 12) + 1
                                  ? ((new Date().getMonth() + 2) % 12) + 1
                                  : expiry[1],
                              ].includes(n + 1) ? (
                                <Flex css={{ flexWrap: "wrap" }}>
                                  {range(
                                    new Date(
                                      expiry.length
                                        ? expiry[0]
                                        : new Date().getFullYear(),
                                      n + 1,
                                      0
                                    ).getDate()
                                  ).map((d) => (
                                    <div
                                      css={{
                                        padding: 4,
                                        background: "white",
                                        border:
                                          expiry[0] ===
                                            new Date().getFullYear() &&
                                          n === new Date().getMonth() &&
                                          d + 1 === new Date().getDate()
                                            ? "1px solid black"
                                            : undefined,
                                        width: 20,
                                        height: 20,
                                        margin: 1,
                                        textAlign: "center",
                                        ...(expiry[1] === n + 1 &&
                                        expiry[2] === d + 1
                                          ? {
                                              background: "black",
                                              color: "white",
                                            }
                                          : {}),
                                      }}
                                      onClick={() => {
                                        setExpiry([
                                          expiry.length
                                            ? expiry[0]
                                            : new Date().getFullYear(),
                                          n + 1,
                                          d + 1,
                                        ]);
                                      }}
                                    >
                                      {d + 1}
                                    </div>
                                  ))}
                                </Flex>
                              ) : null}
                            </Stack>
                          );
                        })}
                    </Flex>
                  </Stack>
                </Flex>
              </Stack>
              {/*Object.entries(preferredProducts)
                .filter(([, { options }]) => options[data.Stockcode])
                .map(([name, { id, options }]) => {
                  const ingredient = (recipes || [])
                    .map((recipe) => recipe.ingredients)
                    .flat()
                    .find((ingredient) => ingredient.type.id === name);
                  const product = options[data.Stockcode];
                  if (!ingredient) {
                    return null;
                  }
                  const { ratio } = convertIngredientToProduct(
                    ingredient,
                    product,
                    productConversions
                  );
                  const equivalentIngredient = normaliseProduct(
                    product,
                    ingredient
                  );
                  if (!equivalentIngredient) {
                    return null;
                  }
                  console.log({ ratio, ingredient, equivalentIngredient });
                  return (
                    <IngredientCard
                      ingredient={{
                        ...equivalentIngredient,
                        qty: ratio,
                      }}
                    ></IngredientCard>
                  );
                })*/}
            </Stack>
          </Stack>
        ) : (
          <>{barcode} (No Product Available)</>
        )
      ) : (
        <Spinner />
      )}
    </div>
  );
}

export function PantryPage() {
  const mealPlan = useContext(MealPlanContext);

  const recipes = useSubscription<Recipe[]>((setRecipes) =>
    RecipesCollection.subscribe((recipes) => setRecipes(getRecipes(recipes)))
  );

  const [barcodes, setBarcodes] = useState<{
    [key: string]: { complete: boolean; data?: Product };
  }>({});

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
              options: doc.data() as { [key: number]: Product },
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
            { id: id, options: data as { [key: number]: Product } },
          ])
        )
    ) || {};

  const preferredProducts: {
    [key: string]: { id: string; options: { [key: number]: Product } };
  } = {
    ...preferredProductsCollection,
    ...preferredProductsDocument,
  };
  /*
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
*/
  const [toScan, setToScan] = useState<string | undefined>();

  useEffect(() => {
    if (toScan) {
      if (!barcodes[toScan]) {
        setBarcodes((barcodes) => ({
          ...barcodes,
          [toScan]: { complete: false },
        }));
        playSound(
          "https://freesound.org/data/previews/131/131708_2154804-lq.mp3"
        );
        (document as any).woolies.search(toScan).then((result: any) => {
          console.log(result);
          setBarcodes((barcodes) => ({
            ...barcodes,
            [toScan]: {
              complete: true,
              data: result.Products
                ? trimProduct(result.Products[0].Products[0] as Product)
                : undefined,
            },
          }));
        });
      }
      setToScan(undefined);
    }
  }, [barcodes, toScan]);

  const { household } = useContext(AuthStateContext);

  const productPantry =
    useFirestoreDoc(
      household,
      (household) => household.ref.collection("blobs").doc("productPantry"),
      (snapshot) => snapshot.data()
    ) || {};

  if (!mealPlan || !recipes) return <Spinner />;

  console.log(preferredProducts, barcodes);

  return (
    <Flex>
      <Stack css={{ flexGrow: 1 }}>
        <h1>Pantry</h1>
        <h2>Scan Items</h2>
        <BarcodeScannerComponent
          width={400}
          height={300}
          delay={100}
          onUpdate={debounce((err, result) => {
            if (result) {
              const barcode = (result as any).getText();
              if (!barcodes[barcode]) {
                setToScan(barcode);
              }
            }
          })}
          facingMode="user"
        />
        {Object.entries(barcodes).map(([barcode, { complete, data }]) => {
          const existingProduct = productPantry[barcode];
          return (
            <ProductProperties
              key={barcode}
              barcode={barcode}
              complete={complete}
              data={data}
              onDone={() =>
                setBarcodes(({ [barcode]: _, ...barcodes }) => barcodes)
              }
              initialQty={existingProduct ? existingProduct.qty + 1 : 1}
              initialExpiry={existingProduct ? existingProduct.expiry : []}
            />
          );
        })}
      </Stack>
      <Stack>
        {Object.entries(productPantry)
          .sort(([, { expiry: a }], [, { expiry: b }]) =>
            a.length === 0
              ? 1
              : b.length === 0
              ? -1
              : a < b
              ? -1
              : a === b
              ? 0
              : 1
          )
          .map(([barcode, { product: data, qty, expiry }]) => (
            <ProductCard
              product={data}
              defaultQuantity={qty}
              onAddToCart={async () => {
                await household?.ref
                  ?.collection("blobs")
                  .doc("productPantry")
                  .set(
                    {
                      [barcode]: firebase.firestore.FieldValue.delete(),
                    },
                    { merge: true }
                  );
              }}
            >
              {expiry.length ? (
                <>
                  Use By{" "}
                  {expiry
                    .map((x: number) =>
                      x.toLocaleString(undefined, {
                        minimumIntegerDigits: 2,
                        useGrouping: false,
                      })
                    )
                    .reverse()
                    .join("/")}{" "}
                </>
              ) : (
                <>Shelf-stable</>
              )}
            </ProductCard>
          ))}
      </Stack>
    </Flex>
  );
}
