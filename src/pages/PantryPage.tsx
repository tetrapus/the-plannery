import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { useHouseholdCollection, useHouseholdDocument } from "data/auth-state";
import { MealPlanContext } from "data/meal-plan";
import { Product, trimProduct } from "data/product";
import { Recipe, RecipesCollection, getRecipes } from "data/recipes";
import React, { useContext, useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useSubscription } from "util/use-subscription";
import { playSound } from "../util/play-sound";
import { ProductCard } from "./ShoppingListPage/ProductCard";
import styled from "@emotion/styled";

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
        margin: "8px 4px",
        ...(selected
          ? { background: "black", color: "white" }
          : current
          ? { border: "1px solid black" }
          : {}),
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
    const barcode = toScan;
    if (barcode && !barcodes[barcode]) {
      setBarcodes((barcodes) => ({
        ...barcodes,
        [barcode]: { complete: false },
      }));
      setToScan(undefined);
      playSound(
        "https://freesound.org/data/previews/131/131708_2154804-lq.mp3"
      );
      (document as any).woolies.search(barcode).then((result: any) => {
        console.log(result);
        setBarcodes((barcodes) => ({
          ...barcodes,
          [barcode]: {
            complete: true,
            data: result.Products
              ? trimProduct(result.Products[0].Products[0] as Product)
              : undefined,
          },
        }));
      });
    }
  }, [toScan, barcodes]);

  const [bounds, setBounds] = useState<[number, number | undefined]>([
    1,
    undefined,
  ]);
  const [qty, setQty] = useState<number | undefined>(1);
  const [expiry, setExpiry] = useState<
    [number] | [number, number] | [number, number, number]
  >([new Date().getFullYear()]);

  if (!mealPlan || !recipes) return <Spinner />;

  console.log(preferredProducts);

  return (
    <Stack>
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
      {Object.entries(barcodes).map(([barcode, { complete, data }]) => (
        <div key={barcode}>
          {complete ? (
            data ? (
              <Stack>
                <Flex>
                  <ProductCard product={data} defaultQuantity={qty} />
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
                          selected
                            ? { color: "white", background: "black" }
                            : {}
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
                        {range(3)
                          .map((n: number) => new Date().getFullYear() + n)
                          .map((n) => {
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
                            .map(
                              (n: number) => (new Date().getMonth() + n) % 12
                            )
                            .map((n) => {
                              const selectedMonth =
                                expiry[1] === undefined
                                  ? new Date().getMonth()
                                  : expiry[1];
                              return (
                                <Stack>
                                  <Month
                                    n={n}
                                    selected={
                                      expiry.length > 1 && expiry[1] === n
                                    }
                                    current={
                                      expiry[0] === new Date().getFullYear() &&
                                      n === new Date().getMonth()
                                    }
                                    onClick={() => setExpiry([expiry[0], n])}
                                  />
                                  {[
                                    selectedMonth,
                                    selectedMonth + 1,
                                    selectedMonth + 2,
                                  ].includes(n) ? (
                                    <Flex css={{ flexWrap: "wrap" }}>
                                      {range(
                                        new Date(2022, n, 0).getDate()
                                      ).map((d) => (
                                        <div
                                          css={{
                                            padding: 4,
                                            background: "white",
                                            border:
                                              expiry[0] ===
                                                new Date().getFullYear() &&
                                              n === new Date().getMonth() &&
                                              d === new Date().getDay()
                                                ? "1px solid black"
                                                : undefined,
                                            width: 20,
                                            height: 20,
                                            margin: 1,
                                            textAlign: "center",
                                            ...(expiry[1] === n &&
                                            expiry[2] === d
                                              ? {
                                                  background: "black",
                                                  color: "white",
                                                }
                                              : {}),
                                          }}
                                          onClick={() => {
                                            setExpiry([expiry[0], n, d]);
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
      ))}
    </Stack>
  );
}
