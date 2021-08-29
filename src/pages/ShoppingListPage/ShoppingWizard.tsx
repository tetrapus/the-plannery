import { Button } from "components/atoms/Button";
import { CardStyle } from "components/atoms/Card";
import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { TextInput } from "components/atoms/TextInput";
import { Darkmode } from "components/styles/Darkmode";
import { AuthStateContext } from "data/auth-state";
import Ingredient from "data/ingredients";
import React, { useContext, useEffect, useState } from "react";
import { Product } from "./ProductCard";

interface Props {
  selectedIngredient?: Ingredient;
}

export function ShoppingWizard({ selectedIngredient }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ Products: Product[] }[]>(
    []
  );
  const { household } = useContext(AuthStateContext);

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

  return (
    <Stack
      css={{
        ...CardStyle,
        width: 400,
        borderRadius: "3px 0px 0px 0px",
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
                      [Darkmode]: {
                        borderColor: "#333",
                      },
                      ":hover": {
                        background: "#f0f0f0",
                        borderBottom: "1px solid #55050b",
                        [Darkmode]: {
                          background: "#333",
                          borderColor: "#333",
                        },
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
  );
}
