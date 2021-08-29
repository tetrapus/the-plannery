import { css } from "@emotion/core";
import { Button } from "components/atoms/Button";
import { CardStyle } from "components/atoms/Card";
import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { TextInput } from "components/atoms/TextInput";
import { QuantityInput } from "components/molecules/QuantityInput";
import { AuthStateContext } from "data/auth-state";
import Ingredient from "data/ingredients";
import { Product } from "data/product";
import React, { useContext, useEffect, useState } from "react";
import { ProductOption } from "./ProductOption";
import { LinkButton } from "../../components/atoms/LinkButton";

interface Props {
  selectedIngredient?: Ingredient;
  onSelection(): void;
}

export function ShoppingWizard({ selectedIngredient, onSelection }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ Products: Product[] }[]>(
    []
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const { household } = useContext(AuthStateContext);

  useEffect(() => {
    setSelectedProduct(undefined);
  }, [selectedIngredient]);

  useEffect(() => {
    if (loading) {
      (document as any).woolies.search(searchTerm).then((result: any) => {
        setSearchResults(result.Products);
        setLoading(false);
      });
    }
  }, [loading, searchTerm]);

  useEffect(() => {
    if (!selectedIngredient) {
      return;
    }
    setSearchTerm(selectedIngredient.type.name);
    setLoading(true);
  }, [selectedIngredient]);

  const chooseProduct = () => {
    if (!selectedProduct || !selectedIngredient) {
      return;
    }
    household?.ref
      .collection("productPreferences")
      .doc(selectedIngredient.type.name)
      .set({
        [selectedProduct.Stockcode]: selectedProduct,
      });
    setSelectedProduct(undefined);
    onSelection();
  };

  return (
    <Stack
      css={css(CardStyle, {
        minWidth: 400,
        borderRadius: "3px 0px 0px 0px",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 2,
      })}
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
                onClick={() => setLoading(true)}
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
                  <>
                    <div
                      css={{
                        opacity:
                          selectedProduct === undefined ||
                          selectedProduct.Stockcode ===
                            result.Products[0].Stockcode
                            ? 1
                            : 0.4,
                      }}
                    >
                      <ProductOption
                        key={result.Products[0].Stockcode}
                        product={result.Products[0]}
                        onSelection={() => {
                          if (!selectedIngredient) {
                            return;
                          }
                          setSelectedProduct(result.Products[0]);
                        }}
                      />
                    </div>
                    {selectedProduct !== undefined &&
                    selectedProduct.Stockcode ===
                      result.Products[0].Stockcode ? (
                      <>
                        <h3 css={{ margin: "16px auto" }}>
                          How much {selectedIngredient.type.name} is this?
                        </h3>
                        <form
                          onSubmit={(e) => {
                            chooseProduct();
                            e.preventDefault();
                          }}
                        >
                          <QuantityInput
                            suffix={selectedIngredient.unit}
                            autoFocus
                          ></QuantityInput>
                        </form>
                        <LinkButton
                          css={{
                            marginLeft: "auto",
                            marginTop: 4,
                            marginRight: 4,
                            marginBottom: 4,
                          }}
                          onClick={() => chooseProduct()}
                        >
                          I don't know
                        </LinkButton>
                        <Button
                          css={{ margin: "16px auto" }}
                          onClick={() => chooseProduct()}
                        >
                          Save Preference
                        </Button>
                      </>
                    ) : null}
                  </>
                ))
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
