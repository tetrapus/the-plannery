import { css } from "@emotion/core";
import { Flex } from "components/atoms/Flex";
import { Spinner } from "components/atoms/Spinner";
import { Stack } from "components/atoms/Stack";
import { TextField, TextInput } from "components/atoms/TextInput";
import { QuantityInput } from "components/molecules/QuantityInput";
import { AuthStateContext } from "data/auth-state";
import Ingredient, { normaliseIngredient } from "data/ingredients";
import { isConvertible, normaliseProduct, Product } from "data/product";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { ProductOption } from "./ProductOption";
import { LinkButton } from "../../components/atoms/LinkButton";
import { TextButton } from "../../components/atoms/TextButton";
import { ExternalLink } from "../../components/atoms/ExternalLink";
import { ErrorBanner } from "../../components/atoms/ErrorBanner";
import { Darkmode } from "components/styles/Darkmode";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import paperbag from "animations/paper-bag.json";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { IconButton } from "../../components/atoms/IconButton";
import { faBarcode } from "@fortawesome/free-solid-svg-icons";
import { WoolworthsAccount } from "data/woolworths";
import { Form, Formik } from "formik";

interface Props {
  selectedIngredient?: Ingredient;
  woolworthsAccount?: WoolworthsAccount;
  onSelection(): void;
  onLogin(): void;
}

export function ShoppingWizard({
  selectedIngredient,
  woolworthsAccount,
  onSelection,
  onLogin,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean | "searchFailed">(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ Products: Product[] }[]>(
    []
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const { household, currentUser } = useContext(AuthStateContext);
  const [conversion, setConversion] = useState<number | undefined>();
  const [otpRequired, setOtpRequired] = useState<boolean>(false);

  useEffect(() => {
    setSelectedProduct(undefined);
  }, [selectedIngredient]);

  useEffect(() => {
    setConversion(undefined);
  }, [selectedProduct]);

  useEffect(() => {
    if (loading) {
      (document as any).woolies
        .search(searchTerm)
        .then((result: any) => {
          setSearchResults(result.Products || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading("searchFailed");
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

  useEffect(() => {
    if (!selectedProduct || !selectedIngredient) return;
    const normalisedIngredient = normaliseIngredient(
      selectedIngredient
    ) as Ingredient;
    const normalisedProduct = normaliseProduct(
      selectedProduct,
      normalisedIngredient
    );
    const convertable = isConvertible(normalisedProduct, normalisedIngredient);
    const estimatedAmount = convertable
      ? normalisedProduct?.qty || 1
      : undefined;

    if (conversion === undefined && estimatedAmount) {
      setConversion(estimatedAmount);
    }
  }, [selectedIngredient, selectedProduct, conversion]);

  const chooseProduct = () => {
    if (!selectedProduct || !selectedIngredient) {
      return;
    }
    const normalisedIngredient = normaliseIngredient(
      selectedIngredient
    ) as Ingredient;
    household?.ref
      .collection("blobs")
      .doc("productPreferences")
      .set(
        {
          [selectedIngredient.type.name]: {
            [selectedProduct.Stockcode]: selectedProduct,
          },
        },
        { mergeFields: [selectedIngredient.type.name] }
      );
    if (conversion) {
      household?.ref
        .collection("blobs")
        .doc("productConversions")
        .set(
          {
            [selectedProduct.Stockcode.toString()]: {
              [normalisedIngredient.unit || "unit"]: conversion,
            },
          },
          { merge: true }
        );
    }
    setSelectedProduct(undefined);

    onSelection();
  };

  return (
    <Stack
      css={css({
        width: 400,
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 2,
        border: "1px solid #dedede",
        borderRight: "none",
        background: "white",
        [Darkmode]: {
          borderColor: "black",
          background: "black",
        },
      })}
    >
      {(document as any).woolies ? (
        woolworthsAccount ? (
          woolworthsAccount.ShopperDetailsRequest ? (
            selectedIngredient ? (
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
                    <IconButton
                      icon={faBarcode}
                      onClick={() => setScanning(!scanning)}
                      css={{ height: "fit-content", margin: 4 }}
                    />
                    <TextButton
                      onClick={() => setLoading(true)}
                      css={{ height: "fit-content", margin: 4 }}
                    >
                      Search
                    </TextButton>
                  </Flex>
                </form>
                {scanning ? (
                  <BarcodeScannerComponent
                    width={400}
                    height={300}
                    onUpdate={(err, result) => {
                      if (result) {
                        setSearchTerm(result.getText());
                        setLoading(true);
                        setScanning(false);
                      }
                    }}
                    facingMode="user"
                  />
                ) : null}
                <Stack css={{ overflow: "scroll" }}>
                  {loading === "searchFailed" ? (
                    <ErrorBanner>
                      Couldn't load search results. Make sure you are logged in
                      to{" "}
                      <ExternalLink
                        href="https://www.woolworths.com.au/"
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{ fontWeight: "bold", color: "#007fed" }}
                      >
                        Woolworths
                      </ExternalLink>{" "}
                      before using this feature.
                    </ErrorBanner>
                  ) : loading ? (
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
                                  value={conversion || ""}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                  ) =>
                                    setConversion(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 0
                                    )
                                  }
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
                              <TextButton
                                css={{ margin: "0 auto 16px" }}
                                onClick={() => chooseProduct()}
                              >
                                Save Preference
                              </TextButton>
                            </>
                          ) : null}
                        </>
                      ))
                  )}
                </Stack>
              </>
            ) : (
              <Stack>
                <AnimatedIconButton
                  animation={paperbag}
                  iconSize={128}
                  autoplay={true}
                  css={{ cursor: "initial", margin: "auto" }}
                />
                <h2 css={{ margin: "8px 16px", textAlign: "center" }}>
                  Choose an ingredient to start shopping
                </h2>
              </Stack>
            )
          ) : (
            <Stack>
              <AnimatedIconButton
                animation={paperbag}
                iconSize={128}
                autoplay={true}
              />
              {otpRequired ? (
                <>
                  {" "}
                  <h2 css={{ margin: "8px 16px", textAlign: "center" }}>
                    Enter the security code sent to you by Woolworths
                  </h2>{" "}
                  <Formik
                    initialValues={{
                      code: "",
                    }}
                    onSubmit={async ({ code }) => {
                      const response = await (document as any).woolies.otp(
                        code
                      );
                      if (response.Successful) {
                        setOtpRequired(false);
                        onLogin();
                      } else {
                        alert(response.ErrorMessage);
                      }
                    }}
                  >
                    <Form>
                      <Stack>
                        <TextField name="code" placeholder="Security Code" />
                        <TextButton type="submit">Log In</TextButton>
                      </Stack>
                    </Form>
                  </Formik>
                </>
              ) : (
                <>
                  <h2 css={{ margin: "8px 16px", textAlign: "center" }}>
                    Log into your Woolworths account
                  </h2>
                  <Formik
                    initialValues={{
                      email: currentUser?.email || "",
                      password: "",
                    }}
                    onSubmit={async ({ email, password }) => {
                      const response = await (document as any).woolies.login(
                        email,
                        password
                      );
                      if (response.LoginResult === "PartialSuccess") {
                        setOtpRequired(true);
                      } else if (response.LoginResult === "Success") {
                        onLogin();
                      } else {
                        alert("Login failed :'(");
                      }
                    }}
                  >
                    <Form>
                      <Stack>
                        <TextField
                          name="email"
                          placeholder="Woolworths Email Address"
                        />
                        <TextField
                          name="password"
                          placeholder="Woolworths Password"
                          type="password"
                        />
                        <TextButton type="submit">Log In</TextButton>
                      </Stack>
                    </Form>
                  </Formik>
                </>
              )}
            </Stack>
          )
        ) : (
          <Spinner />
        )
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
            <ExternalLink
              href="https://www.tampermonkey.net/"
              target="_blank"
              rel="noopener noreferrer"
              css={{ fontWeight: "bold", color: "#007fed" }}
            >
              TamperMonkey
            </ExternalLink>
          </div>
          <div>
            2. Install the{" "}
            <ExternalLink
              href="/woolies.user.js"
              css={{ fontWeight: "bold", color: "#007fed" }}
            >
              Plannery x Woolworths Integration Plugin
            </ExternalLink>
            .
          </div>
          <div>3. Refresh the page.</div>
        </Stack>
      )}
    </Stack>
  );
}
