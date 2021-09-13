import { Flex } from "components/atoms/Flex";
import { Stack } from "components/atoms/Stack";
import { Darkmode } from "components/styles/Darkmode";
import { Product } from "data/product";
import React from "react";

interface Props {
  product: Product;
  onSelection(): void;
}

export function ProductOption({ product, onSelection }: Props) {
  return (
    <Flex
      onClick={() => {
        onSelection();
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
        src={product.SmallImageFile}
        css={{ height: 64, margin: 4 }}
        alt=""
      />

      <Stack css={{ marginLeft: 4, marginTop: 8 }}>
        <div>
          <a
            href={`https://www.woolworths.com.au/shop/productdetails/${product.Stockcode}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {product.Name} {product.PackageSize}
          </a>
        </div>
        <div css={{ fontSize: 12 }}>
          ${product.Price.toFixed(2)}{" "}
          <span css={{ color: "grey" }}>{product.CupString}</span>
        </div>
      </Stack>
    </Flex>
  );
}
